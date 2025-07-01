"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const User_1 = require("./entities/User");
const Tag_1 = require("./entities/Tag");
const Question_1 = require("./entities/Question");
const types_1 = require("./types");
function randomEmail(idx) {
    return `user${idx}_${Math.random().toString(36).substring(2, 8)}@mail.com`;
}
function randomName(prefix, idx) {
    return `${prefix} ${idx} ${Math.random().toString(36).substring(2, 6)}`;
}
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function seed() {
    await data_source_1.AppDataSource.initialize();
    console.log("DB connected");
    // 1. Seed Users
    const users = [];
    for (let i = 0; i < 100; i++) {
        const user = new User_1.User();
        user.email = randomEmail(i);
        user.password = "123456";
        user.role = Object.values(types_1.AppRole)[randomInt(0, Object.values(types_1.AppRole).length - 1)];
        user.avatar_url = undefined;
        users.push(user);
    }
    await data_source_1.AppDataSource.manager.save(users);
    console.log("Seeded 100 users");
    // 2. Seed Tags
    const tags = [];
    for (let i = 0; i < 100; i++) {
        const tag = new Tag_1.Tag();
        tag.name = randomName("Tag", i);
        tag.description = `Description for tag ${i}`;
        tag.creator = randomFrom(users);
        tags.push(tag);
    }
    await data_source_1.AppDataSource.manager.save(tags);
    console.log("Seeded 100 tags");
    // 3. Seed Questions
    const questions = [];
    const questionTypes = ["multiple-choice", "short-answer", "essay", "code"];
    const difficulties = ["easy", "medium", "hard"];
    for (let i = 0; i < 100; i++) {
        const q = new Question_1.Question();
        q.questionName = randomName("Question", i);
        q.questionType = randomFrom(questionTypes);
        q.question = `What is the answer to question ${i}?`;
        q.difficulty_level = randomFrom(difficulties);
        q.creator = randomFrom(users);
        q.tags = Array.from({ length: randomInt(1, 3) }, () => randomFrom(tags));
        q.templateCode = undefined;
        q.cpuTimeLimit = randomInt(1, 5);
        q.memoryLimit = randomInt(32, 256);
        q.testCases = [{ input: "1", output: "1" }, { input: "2", output: "4" }];
        q.correctAnswer = "42";
        q.choices = ["A", "B", "C", "D"];
        q.maxPoint = randomInt(1, 10);
        questions.push(q);
    }
    await data_source_1.AppDataSource.manager.save(questions);
    console.log("Seeded 100 questions");
    await data_source_1.AppDataSource.destroy();
    console.log("Done seeding!");
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
