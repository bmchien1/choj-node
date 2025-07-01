import { Repository, In } from "typeorm";
import { Matrix } from "../entities/Matrix";
import { User } from "../entities/User";
import { Tag } from "../entities/Tag";
import { AppDataSource } from "../data-source";

interface MatrixData {
  name: string;
  description?: string;
  total_points?: number;
  criteria: {
    questionType: string;
    difficulty_level: string;
    tagIds: number[];
    percentage: number;
    quantity: number;
  }[];
}

class MatrixService {
  private readonly matrixRepository: Repository<Matrix>;
  private readonly userRepository: Repository<User>;
  private readonly tagRepository: Repository<Tag>;
  private static instance: MatrixService;

  constructor() {
    this.matrixRepository = AppDataSource.getRepository(Matrix);
    this.userRepository = AppDataSource.getRepository(User);
    this.tagRepository = AppDataSource.getRepository(Tag);
  }

  public static getInstance(): MatrixService {
    if (!MatrixService.instance) {
      MatrixService.instance = new MatrixService();
    }
    return MatrixService.instance;
  }

  async createMatrix(userId: number, body: MatrixData): Promise<Matrix> {
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
      if (!criterion.quantity || criterion.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }
      // Validate tagIds exist
      const tags = await this.tagRepository.findBy({ id: In(criterion.tagIds) });
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

  async getMatricesByUser(userId: number): Promise<Matrix[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return await this.matrixRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "ASC" },
      relations: ["user"],
    });
  }

  async getAllMatrices(): Promise<Matrix[]> {
    return await this.matrixRepository.find({
      order: { createdAt: "ASC" },
      relations: ["user"],
    });
  }

  async getMatricesByUserPaginated(
    userId: number,
    skip: number,
    take: number,
    search?: string,
    sortField?: string,
    sortOrder?: 'ascend' | 'descend'
  ): Promise<[Matrix[], number]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const queryBuilder = this.matrixRepository.createQueryBuilder('matrix')
      .leftJoinAndSelect('matrix.user', 'user')
      .where('user.id = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(matrix.name ILIKE :search OR matrix.description ILIKE :search)',
        { search: `%${search}%` }
      );
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

  async getAllMatricesPaginated(
    skip: number,
    take: number,
    search?: string,
    sortField?: string,
    sortOrder?: 'ascend' | 'descend'
  ): Promise<[Matrix[], number]> {
    const queryBuilder = this.matrixRepository.createQueryBuilder('matrix')
      .leftJoinAndSelect('matrix.user', 'user');

    if (search) {
      queryBuilder.andWhere(
        '(matrix.name ILIKE :search OR matrix.description ILIKE :search)',
        { search: `%${search}%` }
      );
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

  async getMatrixById(matrixId: number): Promise<Matrix> {
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

  async updateMatrix(matrixId: number, body: Partial<MatrixData>): Promise<Matrix> {
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
        if (!criterion.quantity || criterion.quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }
        // Validate tagIds exist
        const tags = await this.tagRepository.findBy({ id: In(criterion.tagIds) });
        if (tags.length !== criterion.tagIds.length) {
          throw new Error("One or more tag IDs are invalid");
        }
      }
    }

    Object.assign(matrix, body);
    return await this.matrixRepository.save(matrix);
  }

  async deleteMatrix(matrixId: number): Promise<{ message: string }> {
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

export { MatrixService };