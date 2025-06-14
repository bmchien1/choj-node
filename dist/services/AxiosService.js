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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const queryString = __importStar(require("node:querystring"));
class AxiosService {
    constructor() {
        this.axiosClient = axios_1.default.create({
            baseURL: process.env.JUDGE_SERVER_URL,
            headers: {
                "Content-Type": "application/json",
            },
            paramsSerializer: (params) => queryString.stringify(params),
        });
        this.axiosClient.interceptors.response.use((response) => {
            if (response && response.data) {
                return response.data;
            }
            return response;
        }, (error) => {
            return Promise.reject(error.response.data);
        });
    }
    static getInstance() {
        if (!AxiosService.instance) {
            AxiosService.instance = new AxiosService();
        }
        return AxiosService.instance;
    }
    async get(url, query = {}) {
        return await this.axiosClient.get(url, { params: query });
    }
    async post(url, body = {}) {
        return await this.axiosClient.post(url, body);
    }
    async put(url, body = {}) {
        return await this.axiosClient.put(url, body);
    }
    async delete(url, query = {}) {
        return await this.axiosClient.delete(url, { params: query });
    }
}
exports.default = AxiosService;
