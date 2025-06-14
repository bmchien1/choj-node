import { Repository } from "typeorm";
import { Submission } from "../entities/Submission";
import { AppDataSource } from "../data-source";
import { Question } from "../entities/Question";
import CompilerService from "./CompilerService";
import { User } from "../entities/User";
import { Assignment } from "../entities/Assignment";
import { Contest } from "../entities/Contest";
import { Course } from "../entities/Course";

interface Answer {
  questionId: number;
  sourceCode: string;
  language?: string;
}

class SubmissionService {
  private readonly submissionRepository: Repository<Submission>;
  private readonly questionRepository: Repository<Question>;
  private readonly userRepository: Repository<User>;
  private readonly assignmentRepository: Repository<Assignment>;
  private readonly contestRepository: Repository<Contest>;
  private readonly courseRepository: Repository<Course>;
  private readonly compilerService: CompilerService;
  private static instance: SubmissionService;

  constructor() {
    this.submissionRepository = AppDataSource.getRepository(Submission);
    this.questionRepository = AppDataSource.getRepository(Question);
    this.userRepository = AppDataSource.getRepository(User);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.contestRepository = AppDataSource.getRepository(Contest);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.compilerService = CompilerService.getInstance();
  }

  public static getInstance(): SubmissionService {
    if (!SubmissionService.instance) {
      SubmissionService.instance = new SubmissionService();
    }
    return SubmissionService.instance;
  }

  private languageMap: { [key: string]: string } = {
    javascript: "javascript",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    c_cpp: "cpp",
  };

  public async submitAssignment(
    userId: number,
    assignmentId: number | undefined,
    testId: number | undefined,
    answers: Answer[]
  ): Promise<Submission> {
    if (!userId || (!assignmentId && !testId)) {
      throw new Error("User ID and either assignment ID or test ID are required");
    }

    if (assignmentId && testId) {
      throw new Error("Submission cannot be linked to both an assignment and a test");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    let assignment: Assignment | null = null;
    let contest: Contest | null = null;
    let course: Course | null = null;

    if (assignmentId) {
      assignment = await this.assignmentRepository.findOne({
        where: { id: assignmentId },
        relations: ["questions", "course"],
      });
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);
      course = assignment.course;
    } else if (testId) {
      contest = await this.contestRepository.findOne({
        where: { id: testId },
        relations: ["questions"],
      });
      if (!contest) throw new Error(`Contest ${testId} not found`);
    }

    // Create submission even if there are no answers
    const submission = this.submissionRepository.create({
      user,
      assignment: assignment ?? undefined,
      contest: contest ?? undefined,
      course: course ?? undefined,
      answers: answers.length > 0 ? JSON.stringify(answers) : JSON.stringify([]),
      score: 0,
      submitted_at: new Date(),
    });

    const savedSubmission = await this.submissionRepository.save(submission);

    // If no answers provided, return submission with 0 score
    if (!answers.length) {
      return savedSubmission;
    }

    let totalScore = 0;
    const evaluationResults: any[] = [];

    // Load question_scores from assignment or use test's questions_scores
    const questionScores = assignment
      ? assignment.questions_scores || {}
      : contest?.questions_scores || {};

    for (const answer of answers) {
      if (!answer.sourceCode?.trim()) {
        evaluationResults.push({
          questionId: answer.questionId,
          passed: false,
          score: 0,
          error: "No answer provided",
        });
        continue;
      }

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

      if (question.questionType === "true-false") continue;

      const mappedLanguage = this.languageMap[answer.language?.toLowerCase() || question.language?.toLowerCase() || "javascript"] || "javascript";
      const maxPoints = questionScores[question.id] || question.maxPoint || 10;

      if (question.questionType === "coding") {
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

        try {
          const results = await this.compilerService.runCode(
            mappedLanguage,
            answer.sourceCode,
            testCases
          );

          const passedTests = results.filter((r) => r.passed).length;
          const totalTests = testCases.length;
          const questionScore = Math.round((passedTests / totalTests) * maxPoints);
          const allPassed = passedTests === totalTests;

          totalScore += questionScore;

          evaluationResults.push({
            questionId: answer.questionId,
            results: results.map((r, idx) => ({
              testCase: idx + 1,
              passed: r.passed,
              output: r.output,
              expected: testCases[idx].output,
              error: r.error,
            })),
            passed: allPassed,
            score: questionScore,
            maxPoints,
          });
        } catch (err: any) {
          evaluationResults.push({
            questionId: answer.questionId,
            passed: false,
            score: 0,
            error: err.message || "Failed to evaluate code",
          });
        }
      } else {
        const isCorrect = this.checkAnswer(question, answer.sourceCode);
        const questionScore = isCorrect ? maxPoints : 0;
        totalScore += questionScore;

        evaluationResults.push({
          questionId: answer.questionId,
          passed: isCorrect,
          score: questionScore,
          maxPoints,
          output: answer.sourceCode,
        });
      }
    }

    savedSubmission.score = totalScore;
    savedSubmission.results = JSON.stringify(evaluationResults);

    return await this.submissionRepository.save(savedSubmission);
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
      const mappedLanguage = this.languageMap[language.toLowerCase()] || "javascript";
      const result = await this.compilerService.runCode(mappedLanguage, sourceCode, [{ input, output: "" }]);
      return {
        output: result[0]?.output || "",
        error: result[0]?.error || "",
      };
    } catch (err: any) {
      return { error: err.message || "Failed to run code" };
    }
  }

  public async getSubmissionsByAssignment(assignmentId: number): Promise<Submission[]> {
    if (!assignmentId) throw new Error("Assignment ID is required");

    return this.submissionRepository.find({
      where: { assignment: { id: assignmentId } },
      relations: ["user", "assignment"],
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
}

export default SubmissionService;