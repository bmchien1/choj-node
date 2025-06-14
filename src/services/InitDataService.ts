import { User } from "../entities/User";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcrypt";
import { AppRole } from "../types";

class InitDataService {
  private readonly userRepository: Repository<User>;
  private static instance: InitDataService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance() {
    if (!InitDataService.instance) {
      InitDataService.instance = new InitDataService();
    }
    return InitDataService.instance;
  }

  public async initAdminAccount() {
    const email = process.env.ADMIN_EMAIL || "minhnguyen@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@1234";

    const adminExist = await this.userRepository.findOne({
      where: { email },
    });

    if (adminExist && adminExist.role === AppRole.ADMIN) {
      console.log("Admin account already exists");
      return;
    }

    if (adminExist && adminExist.role !== AppRole.ADMIN) {
      await this.userRepository.remove(adminExist);
    }

    const admin = new User();
    admin.email = email;
    admin.password = bcrypt.hashSync(password, 10);
    admin.role = AppRole.ADMIN;

    await this.userRepository.save(admin);
    console.log("Admin account created");
  }
}

export default InitDataService;