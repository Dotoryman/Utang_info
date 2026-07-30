export type Fortune = {
  id: string;
  title: string;
  message: string;
  luckyColor: string;
  luckyAction: string;
  acorn: string;
  utangMessage: string;
};

export type DailyFortune = {
  version: 2;
  date: string;
  fortuneId: string;
  luckyNumbers: number[];
};

export type RandomIndex = (max: number) => number;
