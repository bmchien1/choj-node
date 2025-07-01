import { Repository } from "typeorm";
import { Submission } from "../entities/Submission";
import { AppDataSource } from "../data-source";
import { Question } from "../entities/Question";
import { User } from "../entities/User";
import { Assignment } from "../entities/Assignment";
import { Contest } from "../entities/Contest";
import { Course } from "../entities/Course";
import axios from "axios";

interface Answer {
  questionId: number;
  sourceCode: string;
  language?: string;
}

interface CodingAnswer {
  sourceCode: string;
  language: string;
  testCases: any[];
  timeLimit: number;
  cpuLimit: number;
  memoryLimit: number;
  callbackUrl: string;
}

interface EvaluationResult {
  results: any[];
  score: number;
  error?: string;
}

interface CodingQuestion {
  questionId: number;
  sourceCode: string;
  language: string;
  testCases: any[];
  timeLimit: number;
  cpuLimit: number;
  memoryLimit: number;
}

class SubmissionService {
  private readonly submissionRepository: Repository<Submission>;
  private readonly questionRepository: Repository<Question>;
  private readonly userRepository: Repository<User>;
  private readonly assignmentRepository: Repository<Assignment>;
  private readonly contestRepository: Repository<Contest>;
  private static instance: SubmissionService;
  private readonly evaluationServiceUrl: string;

  constructor() {
    this.submissionRepository = AppDataSource.getRepository(Submission);
    this.questionRepository = AppDataSource.getRepository(Question);
    this.userRepository = AppDataSource.getRepository(User);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.contestRepository = AppDataSource.getRepository(Contest);
    this.evaluationServiceUrl = process.env.EVALUATION_SERVICE_URL || "http://localhost:5001";
  }

  public static getInstance(): SubmissionService {
    if (!SubmissionService.instance) {
      SubmissionService.instance = new SubmissionService();
    }
    return SubmissionService.instance;
  }

  private languageMap: { [key: string]: string } = {
    python: "python",
    java: "java",
    cpp: "cpp",
  };

  public async submitAssignment(
    userId: number,
    assignmentId: number | undefined,
    testId: number | undefined,
    answers: Answer[]
  ): Promise<Submission> {
    console.log('=== Starting Submission Process ===');
    console.log('Input parameters:', { userId, assignmentId, testId, answers });

    if (!userId || (!assignmentId && !testId)) {
      console.error('Validation failed: Missing required parameters');
      throw new Error("User ID and either assignment ID or test ID are required");
    }

    if (assignmentId && testId) {
      console.error('Validation failed: Cannot have both assignmentId and testId');
      throw new Error("Submission cannot be linked to both an assignment and a test");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.error('User not found:', userId);
      throw new Error("User not found");
    }
    console.log('Found user:', { id: user.id, email: user.email });

    let assignment: Assignment | null = null;
    let contest: Contest | null = null;
    let course: Course | null = null;

    if (assignmentId) {
      assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
        relations: ["questions", "course"],
      });
      if (!assignment) {
        console.error('Assignment not found:', assignmentId);
        throw new Error(`Assignment ${assignmentId} not found`);
      }
      course = assignment.course;
      console.log('Found assignment:', { 
        id: assignment.id, 
        title: assignment.title,
        courseId: course?.id 
      });
    } else if (testId) {
      contest = await this.contestRepository.findOne({
        where: { id: testId },
        relations: ["questions"],
      });
      if (!contest) {
        console.error('Contest not found:', testId);
        throw new Error(`Contest ${testId} not found`);
      }
      console.log('Found contest:', { id: contest.id, title: contest.title });
    }

    // Create submission with pending status
    console.log('Creating submission record...');
    const submission = this.submissionRepository.create({
      user,
      assignment: assignment ?? undefined,
      contest: contest ?? undefined,
      course: course ?? undefined,
      answers: answers.length > 0 ? JSON.stringify(answers) : JSON.stringify([]),
      score: 0,
      submitted_at: new Date(),
      status: "pending"
    });

    const savedSubmission = await this.submissionRepository.save(submission);
    console.log('Saved submission:', { 
      id: savedSubmission.id, 
      status: savedSubmission.status,
      submitted_at: savedSubmission.submitted_at 
    });

    // If no answers provided, return submission with 0 score
    if (!answers.length) {
      console.log('No answers provided, returning submission with 0 score');
      return savedSubmission;
    }

    try {
      // Process non-coding questions first
      const evaluationResults: any[] = [];
      let totalScore = 0;
      const codingAnswers: CodingAnswer[] = [];

      // Load question_scores from assignment or use test's questions_scores
      const questionScores = assignment
        ? assignment.questions_scores || {}
        : contest?.questions_scores || {};

      for (const answer of answers) {
        const question = await this.questionRepository.findOne({ where: { id: answer.questionId } });
        if (!question) {
          evaluationResults.push({
            questionId: answer.questionId,
            passed: false,
            score: 0,
            error: "Question not found",
          });
          continue;
        }

        const maxPoints = questionScores[question.id] || question.maxPoint || 10;

        if (question.questionType === "multiple-choice" || question.questionType === "short-answer") {
          // Process non-coding questions immediately
          const isCorrect = this.checkAnswer(question, answer.sourceCode);
          const questionScore = isCorrect ? maxPoints : 0;
          totalScore += questionScore;

          evaluationResults.push({
            questionId: answer.questionId,
            passed: isCorrect,
            score: questionScore,
            maxPoints,
            output: answer.sourceCode,
            type: question.questionType
          });
        } else if (question.questionType === "coding") {
          // Collect coding questions for evaluation service
          const testCases = question.testCases || [];
          if (!testCases.length) {
            evaluationResults.push({
              questionId: answer.questionId,
              passed: false,
              score: 0,
              error: "No test cases defined",
            });
            continue;
          }

          const callbackUrl = `${process.env.API_URL || "http://host.docker.internal:8080"}/api/submissions/${savedSubmission.id}/questions/${answer.questionId}/evaluation-result`;
          codingAnswers.push({
            sourceCode: answer.sourceCode,
            language: answer.language || "python",
            testCases,
            timeLimit: question.cpuTimeLimit || 1000,
            cpuLimit: 100,
            memoryLimit: question.memoryLimit || 128,
            callbackUrl
          });
        }
      }

      // Update submission with non-coding results
      savedSubmission.results = JSON.stringify(evaluationResults);
      savedSubmission.score = totalScore;

      if (codingAnswers.length > 0) {
        // Send coding answers to evaluation service
        console.log('Sending coding answers to evaluation service...');
        await this.sendToEvaluationService(codingAnswers);
        
        // Update status to evaluating
        savedSubmission.status = "evaluating";
      } else {
        // All questions are done, mark as completed
        savedSubmission.status = "completed";
      }

      return await this.submissionRepository.save(savedSubmission);

    } catch (error) {
      console.error('Error in evaluation process:', error);
      savedSubmission.status = "failed";
      savedSubmission.results = JSON.stringify([{ error: "Failed to process submission" }]);
      return await this.submissionRepository.save(savedSubmission);
    }
  }

  private async sendToEvaluationService(codingAnswers: CodingAnswer[]): Promise<void> {
    console.log('=== Sending to Evaluation Service ===');
    console.log('Coding Answers:', codingAnswers);
    
    try {
      await axios.post(`${this.evaluationServiceUrl}/evaluate`, {
        answers: codingAnswers
      });
      console.log('Successfully sent to evaluation service');
    } catch (error) {
      console.error('Error sending to evaluation service:', error);
      throw error;
    }
  }

  public async handleEvaluationResult(submissionId: number, questionId: number, result: EvaluationResult): Promise<Submission> {
    console.log('=== Handling Evaluation Result ===');
    console.log('Submission ID:', submissionId);
    console.log('Question ID:', questionId);
    console.log('Result:', result);

    const submission = await this.submissionRepository.findOne({ where: { id: submissionId } });
    if (!submission) {
      console.error('Submission not found:', submissionId);
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Get existing results
    const existingResults = JSON.parse(submission.results || '[]');
    
    // Calculate question score based on passed test cases
    const totalTests = result.results.length;
    const questionScore = Math.round((result.score / totalTests) * 10); // Assuming max point is 10

    // Add coding results
    const updatedResults = [
      ...existingResults,
      {
        questionId: questionId,
        results: result.results,
        passed: result.score === totalTests,
        score: questionScore,
        maxPoints: 10,
        error: result.error
      }
    ];

    // Update submission with new results
    submission.score = submission.score + questionScore;
    submission.results = JSON.stringify(updatedResults);

    // Check if all coding questions have been evaluated
    const answers = JSON.parse(submission.answers || '[]');
    const codingQuestions = answers.filter((a: Answer) => {
      const result = updatedResults.find(r => r.questionId === a.questionId);
      return result !== undefined;
    });

    if (codingQuestions.length === answers.length) {
      submission.status = "completed";
    }

    const updatedSubmission = await this.submissionRepository.save(submission);
    console.log('Updated submission with evaluation result:', {
      id: updatedSubmission.id,
      status: updatedSubmission.status,
      score: updatedSubmission.score
    });

    return updatedSubmission;
  }

  private checkAnswer(question: Question, answer: string): boolean {
    switch (question.questionType) {
      case "multiple-choice":
      case "short-answer":
        return question.correctAnswer?.toLowerCase() === answer.toLowerCase();
      default:
        return false;
    }
  }

  public async buildCode(
    language: string,
    sourceCode: string,
    input: string
  ): Promise<{ output?: string; error?: string }> {
    console.log(`Building code, language: ${language}, sourceCode:\n${sourceCode}, input:\n${input}`);
    
    if (!sourceCode.trim()) {
      throw new Error("Source code cannot be empty");
    }
    if (/^\d+$/.test(sourceCode.trim())) {
      throw new Error("Source code cannot be a numeric value");
    }

    try {
      const mappedLanguage = this.languageMap[language.toLowerCase()] || "python";
      
      // Send to evaluation service with build type
      const response = await axios.post(`${this.evaluationServiceUrl}/build`, {
        type: "build",
        language: mappedLanguage,
        sourceCode,
        input,
        timeLimit: 1000, // Default 1 second
        cpuLimit: 100, // Default 100%
        memoryLimit: 128 // Default 128MB
      }, {
        timeout: 25000 // 25 seconds timeout for evaluation service
      });

      // Wait for evaluation service to process
      let attempts = 0;
      const maxAttempts = 10;
      const waitTime = 1000; // 1 second

      while (attempts < maxAttempts) {
        if (response.data && (response.data.output !== undefined || response.data.error !== undefined)) {
          return {
            output: response.data.output || "",
            error: response.data.error || "",
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        attempts++;
      }

      return {
        error: "Build timed out. Please try again."
      };
    } catch (err: any) {
      console.error('Build code error:', err);
      if (err.code === 'ECONNABORTED') {
        return { error: "Build request timed out. Please try again." };
      }
      return { 
        error: err.response?.data?.message || err.message || "Failed to run code" 
      };
    }
  }

  public async getSubmissionsByAssignment(assignmentId: number): Promise<Submission[]> {
    if (!assignmentId) throw new Error("Assignment ID is required");

    return this.submissionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ["user", "assignment"],
    });
  }

  public async getSubmissionsByAssignmentAndUser(assignmentId: number, userId: number): Promise<Submission[]> {
    if (!assignmentId || !userId) {
      throw new Error("Assignment ID and User ID are required");
    }

    return this.submissionRepository.find({
      where: { 
        assignment: { id: assignmentId },
        user: { id: userId }
      },
      relations: ["user", "assignment"],
      order: { submitted_at: "DESC" }
    });
  }

  public async getSubmissionsByContest(contestId: number): Promise<Submission[]> {
    if (!contestId) throw new Error("Contest ID is required");

    return this.submissionRepository.find({
      where: { contest: { id: contestId } },
      relations: ["user", "contest"],
    });
  }

  public async getSubmissionsByCourse(courseId: number): Promise<Submission[]> {
    if (!courseId) throw new Error("Course ID is required");

    return this.submissionRepository.find({
      where: { course: { id: courseId } },
      relations: ["user", "course", "assignment"],
    });
  }

  public async getSubmissionsByUser(userId: number): Promise<Submission[]> {
    if (!userId) throw new Error("User ID is required");

    return this.submissionRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "assignment", "test"],
    });
  }

  public async getSubmissionById(submissionId: number): Promise<Submission> {
    if (!submissionId) throw new Error("Submission ID is required");

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ["user", "assignment", "test"],
    });

    if (!submission) throw new Error(`Submission with ID ${submissionId} not found`);
    return submission;
  }

  public async getAllSubmissions(): Promise<Submission[]> {
    return this.submissionRepository.find({
      relations: ["user", "course", "assignment", "contest"],
    });
  }

  async getAllByCourseAndUser(courseId: number, userId: number) {
    return await this.submissionRepository.find({
      where: {
        assignment: { course: { id: courseId } },
        user: { id: userId }
      },
      relations: ["assignment", "user"]
    });
  }

  async countSubmissions(): Promise<number> {
    return this.submissionRepository.count();
  }
}

export default SubmissionService;