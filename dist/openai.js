import OpenAI from "openai";
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
 * 琴葉姉妹解説形式のシナリオを生成する関数
 * @param params シナリオ生成パラメータ
 * @returns 生成されたシナリオテキスト
 */
export async function generateVoiceroidScenario(params) {
    const { topic, minLength = 2000 } = params;
    const prompt = `
あなたは「琴葉姉妹解説」形式のシナリオを作成するライターです。
「${topic}」について、琴葉茜と琴葉葵が解説するシナリオを作成してください。

以下の条件を満たすシナリオを作成してください：
1. 琴葉茜と琴葉葵の姉妹が会話形式で解説する
2. 琴葉茜は関西弁でちょっと天然の姉。語尾に「〜やで」「んっとなぁ」「葵」などを使い、積極的に解説を進める。一人称は「うち」
3. 琴葉葵は標準語でしっかり者の妹。語尾に「〜だね」「えっとぉ」「おねぇちゃん」などを使い、茜の暴走を時々制御する。一人称は「わたし」
4. 「${topic}」について分かりやすく、かつ詳細に解説する
5. 冒頭で簡単な挨拶と今回のテーマ紹介をする
6. 本編では「${topic}」の基本概念、歴史、重要ポイント、応用例などを解説する
7. 最後に簡単なまとめと締めの挨拶をする
8. 全体の文字数は${minLength}文字以上にする
9. 専門用語がある場合は、初心者にも分かるように噛み砕いて説明する
10. 説明だけでなく、キャラクターの反応や感想も挟めると良い
11. 茜と葵の掛け合いを活かし、時には茜が熱くなりすぎて葵がツッコミを入れるような場面も入れる
12. ナレーションは必要最低限でOK。基本的にはキャラクターの会話が中心になるようにする

出力形式：
シナリオ全体を出力してください。キャラクターのセリフは「キャラクター名: セリフ内容」の形式で記述してください。
例：「琴葉 茜: いくで！」「琴葉 葵: いくよ！」
短く「茜: 」「葵: 」と書いても構いません。
ナレーションや場面転換は「（ナレーション内容）」の形式で記述してください。
`;
    try {
        const response = await openai.chat.completions.create({
            model: "o4-mini-2025-04-16",
            messages: [
                { role: "system", content: "あなたはシナリオライターです。" },
                { role: "user", content: prompt },
            ],
        });
        return response.choices[0].message.content || "";
    }
    catch (error) {
        console.error("Error generating scenario with OpenAI:", error);
        throw new Error(`シナリオ生成に失敗しました: ${error}`);
    }
}
