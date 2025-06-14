import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

class CompilerService {
  private static instance: CompilerService;

  private constructor() {}

  public static getInstance(): CompilerService {
    if (!CompilerService.instance) {
      CompilerService.instance = new CompilerService();
    }
    return CompilerService.instance;
  }

  public async runCode(
    language: string,
    sourceCode: string,
    testCases: { input: string; output: string }[]
  ): Promise<{ passed: boolean; output: string; error?: string }[]> {
    if (!language || !sourceCode || !testCases?.length) {
      throw new Error("Language, source code, and test cases are required");
    }

    const results: { passed: boolean; output: string; error?: string }[] = [];

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
      } catch (err: any) {
        results.push({
          passed: false,
          output: "",
          error: err.message || "Execution failed",
        });
      }
    }

    return results;
  }

  private async executeCode(language: string, sourceCode: string, input: string): Promise<{ stdout: string; stderr: string }> {
    let command: string;
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
      await fs.unlink(inputFile).catch(() => {});
      if (mappedLanguage === "cpp") {
        await fs.unlink(`${tempFilePrefix}.cpp`).catch(() => {});
        await fs.unlink(process.platform === "win32" ? `${tempFilePrefix}.exe` : `${tempFilePrefix}`).catch(() => {});
      }
  
      return { stdout, stderr };
    } catch (error) {
      // Clean up on error
      await fs.unlink(inputFile).catch(() => {});
      if (mappedLanguage === "cpp") {
        await fs.unlink(`${tempFilePrefix}.cpp`).catch(() => {});
        await fs.unlink(process.platform === "win32" ? `${tempFilePrefix}.exe` : `${tempFilePrefix}`).catch(() => {});
      }
      throw error;
    }
  }
}

export default CompilerService;