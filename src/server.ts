import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateYukkuriScenario } from "./openai.js";
import { parseYukkuriScenario } from "./scenario.js";
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
    name: "Exia Yukkuri Scenario Generator",
    version: "1.0.0",
  });

  // exiaマネージャーの初期化
  const exiaManager = new ExiaManager(path.resolve(__dirname, ".."));

  // シナリオ生成ツール
  server.tool("generateScenario", { topic: z.string() }, async ({ topic }) => {
    try {
      // シナリオの生成
      const rawScenario = await generateYukkuriScenario({ topic, minLength: 2000 });

      // シナリオのパースとexia形式への変換
      const scenario = parseYukkuriScenario(rawScenario);

      return {
        content: [
          {
            type: "text",
            text: `「${topic}」についてのゆっくり解説シナリオを生成しました。`,
          },
        ],
      };
    } catch (error) {
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
    } catch (error) {
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
      const rawScenario = await generateYukkuriScenario({ topic, minLength: 2000 });

      // シナリオのパースとexia形式への変換
      const scenario = parseYukkuriScenario(rawScenario);

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
    } catch (error) {
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

  // exia起動ツール
  server.tool("playExia", {}, async () => {
    try {
      // exiaの起動
      const url = await exiaManager.start();

      return {
        content: [
          {
            type: "text",
            text: `exiaを起動しました。ブラウザで ${url} にアクセスしてください。`,
          },
        ],
      };
    } catch (error) {
      console.error("Error starting exia:", error);
      return {
        content: [
          {
            type: "text",
            text: `exiaの起動に失敗しました: ${error}`,
          },
        ],
        isError: true,
      };
    }
  });

  // オールインワンツール（シナリオ生成からexia起動まで一括実行）
  server.tool("exiaYukkuriExplain", { topic: z.string() }, async ({ topic }) => {
    try {
      // 1. シナリオの生成
      console.error(`Generating scenario for topic: ${topic}`);
      const rawScenario = await generateYukkuriScenario({ topic, minLength: 2000 });

      // 2. シナリオのパースとexia形式への変換
      console.error("Parsing scenario to exia format");
      const scenario = parseYukkuriScenario(rawScenario);

      // 3. exiaのセットアップ（必要な場合）
      if (!(await exiaManager.checkSetup())) {
        console.error("Setting up exia");
        await exiaManager.setup();
      }

      // 4. シナリオの保存
      console.error("Saving scenario");
      await exiaManager.saveScenario(scenario);

      // 5. exiaの起動
      console.error("Starting exia");
      const url = await exiaManager.start();

      return {
        content: [
          {
            type: "text",
            text: `「${topic}」についてのゆっくり解説シナリオを生成し、exiaを起動しました。ブラウザで ${url} にアクセスしてください。`,
          },
        ],
      };
    } catch (error) {
      console.error("Error in exiaYukkuriExplain:", error);
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
