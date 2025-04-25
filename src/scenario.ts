import { Scenario, Line, Character } from "./types.js";

/**
 * ゆっくり解説シナリオをパースしてexia形式に変換する関数
 * @param rawScenario 生成されたシナリオテキスト
 * @returns exia形式のシナリオオブジェクト
 */
export function parseYukkuriScenario(rawScenario: string): Scenario {
  const lines: Line[] = [];
  const characters: Character[] = [
    {
      index: 0,
      name: "ゆっくり魔理沙",
      imageFile: "chara_01.webp",
      isShow: true,
      speakerId: 3,
    },
    {
      index: 1,
      name: "ゆっくり霊夢",
      imageFile: "chara_02.webp",
      isShow: true,
      speakerId: 2,
    },
  ];

  // シナリオのパース処理
  // 正規表現を使って「キャラクター名: セリフ」の形式を抽出
  const scenarioLines = rawScenario.split("\n").filter((line) => line.trim() !== "");

  scenarioLines.forEach((line) => {
    // ナレーション（括弧で囲まれたテキスト）の処理
    if (line.trim().startsWith("（") && line.trim().endsWith("）")) {
      lines.push({
        type: 0, // ナレーション
        text: line.trim().substring(1, line.trim().length - 1),
      });
      return;
    }

    // キャラクターのセリフの処理
    const match = line.match(/^(ゆっくり魔理沙|ゆっくり霊夢)[:：](.*)/);
    if (match) {
      const characterName = match[1];
      const text = match[2].trim();
      const characterIndex = characterName === "ゆっくり魔理沙" ? 0 : 1;

      lines.push({
        character: {
          index: characterIndex,
        },
        type: 1, // セリフ
        text: text,
      });
      return;
    }

    // その他のテキストはナレーションとして扱う
    if (line.trim() !== "") {
      lines.push({
        type: 0, // ナレーション
        text: line.trim(),
      });
    }
  });

  // 最初のナレーションで挨拶を入れる
  if (lines.length > 0 && lines[0].type === 0) {
    lines.unshift({
      type: 0,
      text: "ゆっくり解説へようこそ！今回のテーマについて、ゆっくり魔理沙とゆっくり霊夢が解説します。",
    });
  } else {
    lines.unshift({
      type: 0,
      text: "ゆっくり解説へようこそ！今回のテーマについて、ゆっくり魔理沙とゆっくり霊夢が解説します。",
    });
  }

  return {
    id: "S_000",
    backgroundFile: "bg_01.webp",
    currentLineIndex: 0,
    characters,
    lines,
  };
}
