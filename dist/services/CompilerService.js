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
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class CompilerService {
    constructor() { }
    static getInstance() {
        if (!CompilerService.instance) {
            CompilerService.instance = new CompilerService();
        }
        return CompilerService.instance;
    }
    async runCode(language, sourceCode, testCases) {
        if (!language || !sourceCode || !testCases?.length) {
            throw new Error("Language, source code, and test cases are required");
        }
        const results = [];
        for (const testCase of testCases) {
            try {
                const { stdout, stderr } = await this.executeCode(language, sourceCode, testCase.input);
                const output = stdout.trim();
                const expectedOutput = testCase.output.trim();
                results.push({
                    passed: output === expectedOutput,
                    output,
                    error: stderr ? stderr.trim() : undefined,
                });
            }
            catch (err) {
                results.push({
                    passed: false,
                    output: "",
                    error: err.message || "Execution failed",
                });
            }
        }
        return results;
    }
    async executeCode(language, sourceCode, input) {
        let command;
        const tempFilePrefix = `temp_${Date.now()}`;
        const inputFile = `${tempFilePrefix}.in`;
        // Map c_cpp to cpp
        const mappedLanguage = language.toLowerCase() === "c_cpp" ? "cpp" : language.toLowerCase();
        try {
            switch (mappedLanguage) {
                case "javascript":
                    command = `node -e "${sourceCode.replace(/"/g, '\\"')}"`;
                    break;
                case "python":
                    command = `python -c "${sourceCode.replace(/"/g, '\\"')}"`;
                    break;
                case "cpp":
                    const cppFile = `${tempFilePrefix}.cpp`;
                    const exeFile = process.platform === "win32" ? `${tempFilePrefix}.exe` : `${tempFilePrefix}`;
                    await fs.writeFile(cppFile, sourceCode);
                    await execAsync(`g++ ${cppFile} -o ${exeFile}`);
                    command = process.platform === "win32" ? exeFile : `./${exeFile}`;
                    break;
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
            // Write input to a temporary file
            await fs.writeFile(inputFile, input);
            const shell = process.platform === "win32" ? "cmd.exe" : "/bin/bash";
            const shellArgs = process.platform === "win32" ? ["/c"] : ["-c"];
            // Redirect input from the file
            const fullCommand = process.platform === "win32" ? `${command} < ${inputFile}` : `${command} < ${inputFile}`;
            const { stdout, stderr } = await execAsync(fullCommand, {
                timeout: 5000, // 5-second timeout
                maxBuffer: 1024 * 1024, // 1MB output limit
                shell,
            });
            // Clean up temporary files
            await fs.unlink(inputFile).catch(() => { });
            if (mappedLanguage === "cpp") {
                await fs.unlink(`${tempFilePrefix}.cpp`).catch(() => { });
                await fs.unlink(process.platform === "win32" ? `${tempFilePrefix}.exe` : `${tempFilePrefix}`).catch(() => { });
            }
            return { stdout, stderr };
        }
        catch (error) {
            // Clean up on error
            await fs.unlink(inputFile).catch(() => { });
            if (mappedLanguage === "cpp") {
                await fs.unlink(`${tempFilePrefix}.cpp`).catch(() => { });
                await fs.unlink(process.platform === "win32" ? `${tempFilePrefix}.exe` : `${tempFilePrefix}`).catch(() => { });
            }
            throw error;
        }
    }
}
exports.default = CompilerService;
