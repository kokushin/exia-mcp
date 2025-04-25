import OpenAI from "openai";
import { ScenarioGenerationParams } from "./types.js";

// コマンドライン引数からAPIキーを取得
const args = process.argv.slice(2);
let apiKey = process.env.OPENAI_API_KEY;

// --openai-api-key=XXX 形式の引数を探す
for (const arg of args) {
  if (arg.startsWith("--openai-api-key=")) {
    apiKey = arg.split("=")[1];
    break;
  }
}

// APIキーが設定されているか確認
if (!apiKey) {
  console.error("Error: OpenAI API key is not set");
  console.error("Please provide it using --openai-api-key=YOUR_API_KEY argument");
  process.exit(1);
}

// OpenAI APIクライアントの初期化
const openai = new OpenAI({
  apiKey: apiKey,
});

/**
 * ゆっくり解説形式のシナリオを生成する関数
 * @param params シナリオ生成パラメータ
 * @returns 生成されたシナリオテキスト
 */
export async function generateYukkuriScenario(params: ScenarioGenerationParams): Promise<string> {
  const { topic, minLength = 2000 } = params;

  const prompt = `
あなたは「ゆっくり解説」形式のシナリオを作成するライターです。
「${topic}」について、ゆっくり魔理沙とゆっくり霊夢が解説するシナリオを作成してください。

以下の条件を満たすシナリオを作成してください：
1. ゆっくり魔理沙とゆっくり霊夢の2人が会話形式で解説する。会話は必ずしも交互になる必要はない
2. ゆっくり魔理沙は「〜だぜ」「〜なのぜ」などの語尾を使い、少し乱暴だが知識豊富なキャラクター
3. ゆっくり霊夢は「〜よ」「〜ね」などの語尾を使い、穏やかだが時々ツッコミを入れるキャラクター
4. 「${topic}」について分かりやすく、かつ詳細に解説する
5. 冒頭で簡単な挨拶と今回のテーマ紹介をする
6. 本編では「${topic}」の基本概念、歴史、重要ポイント、応用例などを解説する
7. 最後に簡単なまとめと締めの挨拶をする
8. 全体の文字数は${minLength}文字以上にする
9. 専門用語がある場合は、初心者にも分かるように噛み砕いて説明する

出力形式：
シナリオ全体を出力してください。キャラクターのセリフは「キャラクター名: セリフ内容」の形式で記述してください。
ナレーションや場面転換は「（ナレーション内容）」の形式で記述してください。
`;

  try {
    const response = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [
        { role: "system", content: "あなたはシナリオライターです。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating scenario with OpenAI:", error);
    throw new Error(`シナリオ生成に失敗しました: ${error}`);
  }
}
