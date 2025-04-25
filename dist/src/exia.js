import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
/**
 * exiaの操作を管理するクラス
 */
export class ExiaManager {
    /**
     * コンストラクタ
     * @param basePath ベースパス
     */
    constructor(basePath) {
        this.isSetup = false;
        this.exiaProcess = null;
        this.exiaPath = path.join(basePath, "exia");
    }
    /**
     * exiaが既にセットアップされているか確認
     * @returns セットアップ済みかどうか
     */
    async checkSetup() {
        try {
            return fs.existsSync(this.exiaPath) && fs.existsSync(path.join(this.exiaPath, "package.json"));
        }
        catch (error) {
            console.error("Error checking exia setup:", error);
            return false;
        }
    }
    /**
     * exiaをGitHubからダウンロードしてセットアップ
     */
    async setup() {
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
        }
        catch (error) {
            console.error("Error setting up exia:", error);
            throw new Error("Failed to set up exia");
        }
    }
    /**
     * シナリオをexiaのシナリオディレクトリに保存
     * @param scenario exia形式のシナリオオブジェクト
     */
    async saveScenario(scenario) {
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
        }
        catch (error) {
            console.error("Error saving scenario:", error);
            throw new Error("Failed to save scenario");
        }
    }
    /**
     * exiaを起動
     * @returns ローカルサーバのURL
     */
    async start() {
        if (!this.isSetup && !(await this.checkSetup())) {
            throw new Error("exia is not set up");
        }
        try {
            // 既に起動している場合は停止
            if (this.exiaProcess) {
                this.stop();
            }
            // 開発サーバを起動
            this.exiaProcess = exec("npm run dev", { cwd: this.exiaPath });
            // 標準出力をログに出力
            this.exiaProcess.stdout?.on("data", (data) => {
                console.error(`exia stdout: ${data}`);
            });
            // 標準エラー出力をログに出力
            this.exiaProcess.stderr?.on("data", (data) => {
                console.error(`exia stderr: ${data}`);
            });
            // プロセスが終了したときのハンドリング
            this.exiaProcess.on("close", (code) => {
                console.error(`exia process exited with code ${code}`);
                this.exiaProcess = null;
            });
            // ローカルサーバのURLを返す
            return "http://localhost:3000";
        }
        catch (error) {
            console.error("Error starting exia:", error);
            throw new Error("Failed to start exia");
        }
    }
    /**
     * exiaを停止
     */
    stop() {
        if (this.exiaProcess) {
            this.exiaProcess.kill();
            this.exiaProcess = null;
            console.error("exia stopped.");
        }
    }
}
