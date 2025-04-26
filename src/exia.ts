import * as fs from "fs";
import * as path from "path";
import { exec, ChildProcess } from "child_process";
import { promisify } from "util";
import { Scenario } from "./types.js";

const execAsync = promisify(exec);

/**
 * exiaの操作を管理するクラス
 */
export class ExiaManager {
  private exiaPath: string;
  private isSetup: boolean = false;
  private exiaProcess: ChildProcess | null = null;

  /**
   * コンストラクタ
   * @param basePath ベースパス
   */
  constructor(basePath: string) {
    this.exiaPath = path.join(basePath, "exia");
  }

  /**
   * exiaが既にセットアップされているか確認
   * @returns セットアップ済みかどうか
   */
  async checkSetup(): Promise<boolean> {
    try {
      return fs.existsSync(this.exiaPath) && fs.existsSync(path.join(this.exiaPath, "package.json"));
    } catch (error) {
      console.error("Error checking exia setup:", error);
      return false;
    }
  }

  /**
   * exiaをGitHubからダウンロードしてセットアップ
   */
  async setup(): Promise<void> {
    if (await this.checkSetup()) {
      console.error("exia is already set up.");
      this.isSetup = true;
      return;
    }

    console.error("Setting up exia...");

    try {
      // GitHubからexiaをクローン
      await execAsync(`git clone https://github.com/kokushin/exia.git ${this.exiaPath}`);

      // 必要なパッケージをインストール
      await execAsync("npm install", { cwd: this.exiaPath });

      this.isSetup = true;
      console.error("exia setup completed.");
    } catch (error) {
      console.error("Error setting up exia:", error);
      throw new Error("Failed to set up exia");
    }
  }

  /**
   * シナリオをexiaのシナリオディレクトリに保存
   * @param scenario exia形式のシナリオオブジェクト
   */
  async saveScenario(scenario: Scenario): Promise<void> {
    if (!this.isSetup && !(await this.checkSetup())) {
      throw new Error("exia is not set up");
    }

    const scenarioPath = path.join(this.exiaPath, "renderer", "src", "scenarios", "S_000.json");

    try {
      // ディレクトリが存在するか確認
      const scenarioDir = path.dirname(scenarioPath);
      if (!fs.existsSync(scenarioDir)) {
        fs.mkdirSync(scenarioDir, { recursive: true });
      }

      fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
      console.error("Scenario saved to:", scenarioPath);
    } catch (error) {
      console.error("Error saving scenario:", error);
      throw new Error("Failed to save scenario");
    }
  }

  /**
   * exiaを起動（Electronアプリケーションとして）
   * @returns 起動成功メッセージ
   */
  async start(): Promise<string> {
    if (!this.isSetup && !(await this.checkSetup())) {
      throw new Error("exia is not set up");
    }

    try {
      // 既に起動している場合は停止
      if (this.exiaProcess) {
        this.stop();
      }

      console.error("Starting exia as Electron application...");

      // サーバーが起動するのを待つためのPromise
      return new Promise((resolve, reject) => {
        // Electronアプリケーションとして起動
        this.exiaProcess = exec("npm run dev", { cwd: this.exiaPath });

        // タイムアウト処理（30秒後にタイムアウト）
        const timeout = setTimeout(() => {
          reject(new Error("Timeout: exia application startup took too long"));
        }, 30000);

        // 標準出力をログに出力
        this.exiaProcess.stdout?.on("data", (data) => {
          console.error(`exia stdout: ${data}`);

          // アプリケーション起動完了のメッセージを検出
          if (
            data.toString().includes("localhost:3000") ||
            data.toString().includes("Electron App Launched") ||
            data.toString().includes("Electron started") ||
            data.toString().includes("ready started server")
          ) {
            clearTimeout(timeout);
            console.error("exia application started successfully");
            resolve("http://localhost:3000");
          }
        });

        // 標準エラー出力をログに出力
        this.exiaProcess.stderr?.on("data", (data) => {
          console.error(`exia stderr: ${data}`);

          // エラー出力からもアプリケーション起動完了のメッセージを検出
          if (
            data.toString().includes("localhost:3000") ||
            data.toString().includes("Electron App Launched") ||
            data.toString().includes("Electron started") ||
            data.toString().includes("ready started server")
          ) {
            clearTimeout(timeout);
            console.error("exia application started successfully");
            resolve("http://localhost:3000");
          }
        });

        // 5秒後に起動成功とみなす（Electronアプリケーションは別プロセスで起動するため）
        setTimeout(() => {
          if (this.exiaProcess) {
            clearTimeout(timeout);
            console.error("exia application assumed to be started successfully");
            resolve("Exia application started successfully");
          }
        }, 5000);

        // プロセスが終了したときのハンドリング
        this.exiaProcess.on("close", (code) => {
          clearTimeout(timeout);
          console.error(`exia process exited with code ${code}`);
          this.exiaProcess = null;

          // 正常終了でなければエラーとして扱う
          if (code !== 0) {
            reject(new Error(`exia process exited with code ${code}`));
          }
        });

        // エラーハンドリング
        this.exiaProcess.on("error", (err) => {
          clearTimeout(timeout);
          console.error("Error in exia process:", err);
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error starting exia:", error);
      throw new Error("Failed to start exia");
    }
  }

  /**
   * exiaを停止
   */
  stop(): void {
    if (this.exiaProcess) {
      this.exiaProcess.kill();
      this.exiaProcess = null;
      console.error("exia stopped.");
    }
  }
}
