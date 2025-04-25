// exiaのシナリオ型定義
export interface Character {
  index: number;
  name: string;
  imageFile: string;
  isShow: boolean;
  speakerId?: number;
}

export interface Line {
  id?: string;
  character?: {
    index?: number;
    name?: string;
    imageFile?: string;
  };
  cutIn?: {
    imageFile?: string;
    isFullScreen?: boolean;
  };
  type: number; // 0=ナレーション, 1=セリフ, 2=選択肢
  text: string;
  choices?: Array<{
    text: string;
    jumpTo: string;
  }>;
  jumpTo?: string;
}

export interface Scenario {
  id: string;
  backgroundFile: string;
  currentLineIndex: number;
  characters: Character[];
  lines: Line[];
}

// シナリオ生成のパラメータ
export interface ScenarioGenerationParams {
  topic: string;
  minLength?: number;
}
