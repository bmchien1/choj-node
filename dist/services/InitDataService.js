"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../entities/User");
const data_source_1 = require("../data-source");
const bcrypt = __importStar(require("bcrypt"));
const types_1 = require("../types");
class InitDataService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    static getInstance() {
        if (!InitDataService.instance) {
            InitDataService.instance = new InitDataService();
        }
        return InitDataService.instance;
    }
    async initAdminAccount() {
        const email = process.env.ADMIN_EMAIL || "minhnguyen@gmail.com";
        const password = process.env.ADMIN_PASSWORD || "Admin@1234";
        const adminExist = await this.userRepository.findOne({
            where: { email },
        });
        if (adminExist && adminExist.role === types_1.AppRole.ADMIN) {
            console.log("Admin account already exists");
            return;
        }
        if (adminExist && adminExist.role !== types_1.AppRole.ADMIN) {
            await this.userRepository.remove(adminExist);
        }
        const admin = new User_1.User();
        admin.email = email;
        admin.password = bcrypt.hashSync(password, 10);
        admin.role = types_1.AppRole.ADMIN;
        await this.userRepository.save(admin);
        console.log("Admin account created");
    }
}
exports.default = InitDataService;
