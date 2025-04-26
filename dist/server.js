import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateVoiceroidScenario } from "./openai.js";
import { parseVoiceroidScenario } from "./scenario.js";
import { ExiaManager } from "./exia.js";
import * as path from "path";
import { fileURLToPath } from "url";
// ESモジュールで__dirnameを取得するための処理
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * MCPサーバを作成する関数
 * @returns MCPサーバのインスタンス
 */
export async function createServer() {
    // MCPサーバの作成
    const server = new McpServer({
        name: "exia-scenario-generator",
        version: "1.0.0",
    });
    // exiaマネージャーの初期化
    const exiaManager = new ExiaManager(path.resolve(__dirname, ".."));
    // シナリオ生成ツール
    server.tool("generateScenario", { topic: z.string() }, async ({ topic }) => {
        try {
            // シナリオの生成
            const rawScenario = await generateVoiceroidScenario({ topic, minLength: 2000 });
            // シナリオのパースとexia形式への変換
            const scenario = parseVoiceroidScenario(rawScenario);
            return {
                content: [
                    {
                        type: "text",
                        text: `「${topic}」についての琴葉姉妹解説シナリオを生成しました。`,
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error generating scenario:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `シナリオの生成に失敗しました: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // exiaセットアップツール
    server.tool("setupExia", {}, async () => {
        try {
            // exiaのセットアップ
            await exiaManager.setup();
            return {
                content: [
                    {
                        type: "text",
                        text: "exiaのセットアップが完了しました。",
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error setting up exia:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `exiaのセットアップに失敗しました: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // シナリオ保存ツール
    server.tool("saveScenario", { topic: z.string() }, async ({ topic }) => {
        try {
            // シナリオの生成
            const rawScenario = await generateVoiceroidScenario({ topic, minLength: 2000 });
            // シナリオのパースとexia形式への変換
            const scenario = parseVoiceroidScenario(rawScenario);
            // シナリオの保存
            await exiaManager.saveScenario(scenario);
            return {
                content: [
                    {
                        type: "text",
                        text: `「${topic}」についてのシナリオを保存しました。`,
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error saving scenario:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `シナリオの保存に失敗しました: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // 注意: playExiaツールは削除し、exiaVoiceroidExplainツール内でのみexiaを起動するようにしました
    // オールインワンツール（シナリオ生成からexia起動まで一括実行）
    server.tool("exiaVoiceroidExplain", { topic: z.string() }, async ({ topic }) => {
        try {
            // 各ステップの結果を保存する変数
            let rawScenario;
            let scenario;
            let url;
            let setupNeeded = false;
            // 1. シナリオの生成
            console.error(`Generating scenario for topic: ${topic}`);
            try {
                rawScenario = await generateVoiceroidScenario({ topic, minLength: 2000 });
                console.error("Scenario generation completed successfully");
            }
            catch (error) {
                console.error("Error generating scenario:", error);
                throw new Error(`シナリオの生成に失敗しました: ${error}`);
            }
            // 2. シナリオのパースとexia形式への変換
            console.error("Parsing scenario to exia format");
            try {
                scenario = parseVoiceroidScenario(rawScenario);
                console.error("Scenario parsing completed successfully");
            }
            catch (error) {
                console.error("Error parsing scenario:", error);
                throw new Error(`シナリオのパースに失敗しました: ${error}`);
            }
            // 3. exiaのセットアップ（必要な場合）
            try {
                setupNeeded = !(await exiaManager.checkSetup());
                if (setupNeeded) {
                    console.error("Setting up exia");
                    await exiaManager.setup();
                    console.error("Exia setup completed successfully");
                }
                else {
                    console.error("Exia is already set up");
                }
            }
            catch (error) {
                console.error("Error checking or setting up exia:", error);
                throw new Error(`exiaのセットアップに失敗しました: ${error}`);
            }
            // 4. シナリオの保存
            console.error("Saving scenario");
            try {
                await exiaManager.saveScenario(scenario);
                console.error("Scenario saved successfully");
            }
            catch (error) {
                console.error("Error saving scenario:", error);
                throw new Error(`シナリオの保存に失敗しました: ${error}`);
            }
            // 5. exiaの起動（必ず最後に実行）
            console.error("Starting exia (final step)");
            try {
                url = await exiaManager.start();
                console.error(`Exia started successfully at ${url}`);
            }
            catch (error) {
                console.error("Error starting exia:", error);
                throw new Error(`exiaの起動に失敗しました: ${error}`);
            }
            // 全ステップが成功した場合の応答
            // 明確な成功メッセージを返して、Claudeが誤ったエラーメッセージを表示しないようにする
            return {
                content: [
                    {
                        type: "text",
                        text: `✅ 成功: 「${topic}」についての琴葉姉妹解説シナリオを生成し、exiaを正常に起動しました。\n\n処理は正常に完了しました。exiaアプリケーション（Electron）が別ウィンドウで起動しています。シナリオをお楽しみください。`,
                    },
                ],
            };
        }
        catch (error) {
            console.error("Error in exiaVoiceroidExplain:", error);
            return {
                content: [
                    {
                        type: "text",
                        text: `処理に失敗しました: ${error}`,
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
}
