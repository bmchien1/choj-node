"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestService = void 0;
const Test_1 = require("../entities/Test");
const data_source_1 = require("../data-source");
class TestService {
    constructor() {
        this.testRepository = data_source_1.AppDataSource.getRepository(Test_1.Test);
    }
    static getInstance() {
        if (!TestService.instance) {
            TestService.instance = new TestService();
        }
        return TestService.instance;
    }
    async createTest(testData) {
        const test = this.testRepository.create({
            ...testData,
        });
        return await this.testRepository.save(test);
    }
    async getAllTests(query) {
        return await this.testRepository.find();
    }
    async getTestById(id) {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: ["creator", "questions"],
        });
        if (!test) {
            throw new Error("Test not found");
        }
        return test;
    }
    async updateTest(id, testData) {
        const test = await this.testRepository.findOneBy({ id });
        if (!test) {
            throw new Error("Test not found");
        }
        Object.assign(test, testData);
        return await this.testRepository.save(test);
    }
    async deleteTest(id) {
        const test = await this.testRepository.findOneBy({ id });
        if (!test) {
            throw new Error("Test not found");
        }
        await this.testRepository.remove(test);
        return { message: "Test deleted successfully" };
    }
}
exports.TestService = TestService;
