import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Tag } from "./entities/Tag";
import { Question } from "./entities/Question";
import { AppRole } from "./types";

function randomEmail(idx: number) {
  return `user${idx}_${Math.random().toString(36).substring(2, 8)}@mail.com`;
}
function randomName(prefix: string, idx: number) {
  return `${prefix} ${idx} ${Math.random().toString(36).substring(2, 6)}`;
}
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await AppDataSource.initialize();
  console.log("DB connected");

  // 1. Seed Users
  const users: User[] = [];
  for (let i = 0; i < 100; i++) {
    const user = new User();
    user.email = randomEmail(i);
    user.password = "123456";
    user.role = Object.values(AppRole)[randomInt(0, Object.values(AppRole).length - 1)];
    user.avatar_url = undefined;
    users.push(user);
  }
  await AppDataSource.manager.save(users);
  console.log("Seeded 100 users");

  // 2. Seed Tags
  const tags: Tag[] = [];
  for (let i = 0; i < 100; i++) {
    const tag = new Tag();
    tag.name = randomName("Tag", i);
    tag.description = `Description for tag ${i}`;
    tag.creator = randomFrom(users);
    tags.push(tag);
  }
  await AppDataSource.manager.save(tags);
  console.log("Seeded 100 tags");

  // 3. Seed Questions
  const questions: Question[] = [];
  const questionTypes = ["multiple-choice", "short-answer", "essay", "code"];
  const difficulties = ["easy", "medium", "hard"];
  for (let i = 0; i < 100; i++) {
    const q = new Question();
    q.questionName = randomName("Question", i);
    q.questionType = randomFrom(questionTypes);
    q.question = `What is the answer to question ${i}?`;
    q.difficulty_level = randomFrom(difficulties);
    q.creator = randomFrom(users);
    q.tags = Array.from({length: randomInt(1, 3)}, () => randomFrom(tags));
    q.templateCode = undefined;
    q.cpuTimeLimit = randomInt(1, 5);
    q.memoryLimit = randomInt(32, 256);
    q.testCases = [{input: "1", expectedOutput: "1"}, {input: "2", expectedOutput: "4"}];
    q.correctAnswer = "42";
    q.choices = ["A", "B", "C", "D"];
    q.maxPoint = randomInt(1, 10);
    questions.push(q);
  }
  await AppDataSource.manager.save(questions);
  console.log("Seeded 100 questions");

  await AppDataSource.destroy();
  console.log("Done seeding!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 