"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatrixService = void 0;
const typeorm_1 = require("typeorm");
const Matrix_1 = require("../entities/Matrix");
const User_1 = require("../entities/User");
const Tag_1 = require("../entities/Tag");
const data_source_1 = require("../data-source");
class MatrixService {
    constructor() {
        this.matrixRepository = data_source_1.AppDataSource.getRepository(Matrix_1.Matrix);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.tagRepository = data_source_1.AppDataSource.getRepository(Tag_1.Tag);
    }
    static getInstance() {
        if (!MatrixService.instance) {
            MatrixService.instance = new MatrixService();
        }
        return MatrixService.instance;
    }
    async createMatrix(userId, body) {
        if (!userId) {
            throw new Error("User ID is required");
        }
        if (!body.name) {
            throw new Error("Matrix name is required");
        }
        if (!body.criteria || body.criteria.length === 0) {
            throw new Error("At least one criterion is required");
        }
        // Validate criteria percentages sum to 100
        const totalPercentage = body.criteria.reduce((sum, criterion) => sum + criterion.percentage, 0);
        if (totalPercentage !== 100) {
            throw new Error("Criteria percentages must sum to 100");
        }
        // Validate each criterion
        for (const criterion of body.criteria) {
            if (!criterion.questionType || !criterion.difficulty_level || !criterion.tagIds?.length) {
                throw new Error("All criteria fields (questionType, difficulty_level, tagIds) are required");
            }
            if (criterion.percentage <= 0 || criterion.percentage > 100) {
                throw new Error("Percentage must be between 0 and 100");
            }
            // Validate tagIds exist
            const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(criterion.tagIds) });
            if (tags.length !== criterion.tagIds.length) {
                throw new Error("One or more tag IDs are invalid");
            }
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        const matrix = this.matrixRepository.create({
            ...body,
            user,
        });
        return await this.matrixRepository.save(matrix);
    }
    async getMatricesByUser(userId) {
        if (!userId) {
            throw new Error("User ID is required");
        }
        return await this.matrixRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: "ASC" },
            relations: ["user"],
        });
    }
    async getAllMatrices() {
        return await this.matrixRepository.find({
            order: { createdAt: "ASC" },
            relations: ["user"],
        });
    }
    async getMatricesByUserPaginated(userId, skip, take, search, sortField, sortOrder) {
        if (!userId) {
            throw new Error("User ID is required");
        }
        const queryBuilder = this.matrixRepository.createQueryBuilder('matrix')
            .leftJoinAndSelect('matrix.user', 'user')
            .where('user.id = :userId', { userId });
        if (search) {
            queryBuilder.andWhere('(matrix.name ILIKE :search OR matrix.description ILIKE :search)', { search: `%${search}%` });
        }
        if (sortField) {
            const order = sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`matrix.${sortField}`, order);
        }
        return await queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async getAllMatricesPaginated(skip, take, search, sortField, sortOrder) {
        const queryBuilder = this.matrixRepository.createQueryBuilder('matrix')
            .leftJoinAndSelect('matrix.user', 'user');
        if (search) {
            queryBuilder.andWhere('(matrix.name ILIKE :search OR matrix.description ILIKE :search)', { search: `%${search}%` });
        }
        if (sortField) {
            const order = sortOrder === 'descend' ? 'DESC' : 'ASC';
            queryBuilder.orderBy(`matrix.${sortField}`, order);
        }
        return await queryBuilder
            .skip(skip)
            .take(take)
            .getManyAndCount();
    }
    async getMatrixById(matrixId) {
        if (!matrixId) {
            throw new Error("Matrix ID is required");
        }
        const matrix = await this.matrixRepository.findOne({
            where: { id: matrixId },
            relations: ["user"],
        });
        if (!matrix) {
            throw new Error("Matrix not found");
        }
        return matrix;
    }
    async updateMatrix(matrixId, body) {
        if (!matrixId) {
            throw new Error("Matrix ID is required");
        }
        const matrix = await this.matrixRepository.findOne({ where: { id: matrixId } });
        if (!matrix) {
            throw new Error("Matrix not found");
        }
        if (body.criteria) {
            // Validate criteria percentages sum to 100
            const totalPercentage = body.criteria.reduce((sum, criterion) => sum + criterion.percentage, 0);
            if (totalPercentage !== 100) {
                throw new Error("Criteria percentages must sum to 100");
            }
            // Validate each criterion
            for (const criterion of body.criteria) {
                if (!criterion.questionType || !criterion.difficulty_level || !criterion.tagIds?.length) {
                    throw new Error("All criteria fields (questionType, difficulty_level, tagIds) are required");
                }
                if (criterion.percentage <= 0 || criterion.percentage > 100) {
                    throw new Error("Percentage must be between 0 and 100");
                }
                // Validate tagIds exist
                const tags = await this.tagRepository.findBy({ id: (0, typeorm_1.In)(criterion.tagIds) });
                if (tags.length !== criterion.tagIds.length) {
                    throw new Error("One or more tag IDs are invalid");
                }
            }
        }
        Object.assign(matrix, body);
        return await this.matrixRepository.save(matrix);
    }
    async deleteMatrix(matrixId) {
        if (!matrixId) {
            throw new Error("Matrix ID is required");
        }
        const matrix = await this.matrixRepository.findOne({ where: { id: matrixId } });
        if (!matrix) {
            throw new Error("Matrix not found");
        }
        await this.matrixRepository.remove(matrix);
        return { message: "Matrix deleted successfully" };
    }
}
exports.MatrixService = MatrixService;
