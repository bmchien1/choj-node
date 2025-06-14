import { Repository, FindManyOptions, ILike } from "typeorm";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcrypt";
import { AppRole } from "../types";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

class UserService {
  private readonly userRepository: Repository<User>;
  private static instance: UserService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async register(body: { id: string; email: string; password: string }) {
    const emailLowerCase = body.email.toLowerCase();
    const existUser = await this.userRepository.findOneBy({ email: emailLowerCase });
    if (existUser) {
      throw new Error("User already exists");
    }
    const user = new User();
    user.role = AppRole.USER;
    user.email = emailLowerCase;
    user.password = bcrypt.hashSync(body.password, 10);

    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
  }

  async login(body: { email: string; password: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({ email: emailToLower });

    if (!user) {
      throw new Error("User not found");
    }
    if (!bcrypt.compareSync(body.password, user.password)) {
      throw new Error("Password is incorrect");
    }

    const accessToken = jwt.sign(
      { id: user.id, email: emailToLower, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = uuidv4();
    user.refresh_token = refreshToken;
    user.access_token = accessToken;
    await this.userRepository.save(user);

    return {
      jwt: accessToken,
      refreshToken,
      user: user.toApiResponse(),
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const user = await this.userRepository.findOneBy({ refresh_token: refreshToken });
    if (!user || !user.refresh_token) {
      throw new Error("Invalid or expired refresh token");
    }

    const tokenAge = Date.now() - new Date(user.updatedAt).getTime();
    if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
      user.access_token = undefined;
      user.refresh_token = undefined;
      await this.userRepository.save(user);
      throw new Error("Refresh token has expired");
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const newRefreshToken = uuidv4();
    user.access_token = newAccessToken;
    user.refresh_token = newRefreshToken;
    await this.userRepository.save(user);

    return {
      jwt: newAccessToken,
      refreshToken: newRefreshToken,
      user: user.toApiResponse(),
    };
  }

  async logout(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    user.access_token = undefined;
    user.refresh_token = undefined;
    await this.userRepository.save(user);
    return { message: "Logged out successfully" };
  }

  async changePassword(user: User, body: { oldPassword: string; newPassword: string }) {
    if (!bcrypt.compareSync(body.oldPassword, user.password)) {
      throw new Error("Old password is incorrect");
    }
    user.password = bcrypt.hashSync(body.newPassword, 10);
    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
  }

  async updateAdmin(body: { userId: number; role?: string }) {
    const user = await this.userRepository.findOneBy({ id: body.userId });
    if (!user) {
      throw new Error("User not found");
    }
    if (body.role && !Object.values(AppRole).includes(body.role as AppRole)) {
      throw new Error("Invalid role");
    }
    if (body.role) {
      user.role = body.role as AppRole;
    }
    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
  }

  async getOne(query: any = {}) {
    const user = await this.userRepository.findOneBy(query);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getAll(query: any = {}) {
    return await this.userRepository.find();
  }
}

export { UserService };