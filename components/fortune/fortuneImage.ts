import type { DailyFortune, Fortune } from "./fortuneTypes";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const COLORS = {
  cream: "#f8f0df",
  paper: "#fffaf0",
  brown: "#4b2c23",
  brownSoft: "#725044",
  caramel: "#c98664",
  peach: "#e4ad8e",
  yellow: "#f1c950",
};

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.forEach((currentLine, index) => {
    context.fillText(currentLine, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("운세 이미지를 만들지 못했습니다."));
      }
    }, "image/png");
  });
}

export async function createFortuneImage(
  result: DailyFortune,
  fortune: Fortune,
  dateLabel: string,
) {
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이미지 생성 기능을 사용할 수 없습니다.");
  }

  context.fillStyle = COLORS.cream;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.fillStyle = COLORS.peach;
  context.beginPath();
  context.arc(930, 145, 170, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = COLORS.yellow;
  context.beginPath();
  context.arc(105, 1190, 135, 0, Math.PI * 2);
  context.fill();

  context.lineWidth = 18;
  context.strokeStyle = COLORS.brown;
  roundedRect(context, 38, 38, CARD_WIDTH - 76, CARD_HEIGHT - 76, 58);
  context.stroke();

  context.textBaseline = "alphabetic";
  context.textAlign = "left";
  context.fillStyle = COLORS.brown;
  context.font =
    '900 34px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("UTANG FORTUNE HOUSE", 90, 125);

  context.fillStyle = COLORS.brownSoft;
  context.font =
    '700 28px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(dateLabel, 90, 175);

  context.textAlign = "center";
  context.font =
    '900 76px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillStyle = COLORS.brown;
  context.fillText("🌰 오늘의 도토리", CARD_WIDTH / 2, 285);

  context.font =
    '950 58px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  drawWrappedText(context, fortune.title, CARD_WIDTH / 2, 375, 850, 72);

  context.font =
    '650 33px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillStyle = COLORS.brownSoft;
  const messageBottom = drawWrappedText(
    context,
    fortune.message,
    CARD_WIDTH / 2,
    510,
    820,
    52,
  );

  const detailsY = Math.max(665, messageBottom + 35);
  const detailItems = [
    ["행운의 색", fortune.luckyColor],
    ["추천 행동", fortune.luckyAction],
    ["행운의 도토리", fortune.acorn],
  ];

  detailItems.forEach(([label, value], index) => {
    const x = 90 + index * 305;

    context.fillStyle = index === 1 ? "#f8e4d4" : COLORS.paper;
    roundedRect(context, x, detailsY, 280, 145, 28);
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = COLORS.brown;
    context.stroke();

    context.textAlign = "center";
    context.fillStyle = COLORS.brownSoft;
    context.font =
      '800 22px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(label, x + 140, detailsY + 48);

    context.fillStyle = COLORS.brown;
    context.font =
      '900 28px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    drawWrappedText(context, value, x + 140, detailsY + 96, 235, 34);
  });

  const numberPanelY = detailsY + 185;
  context.fillStyle = COLORS.brown;
  roundedRect(context, 90, numberPanelY, 900, 225, 34);
  context.fill();

  context.textAlign = "left";
  context.fillStyle = COLORS.yellow;
  context.font =
    '850 23px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("UTANG LUCKY NUMBERS", 135, numberPanelY + 52);

  result.luckyNumbers.forEach((number, index) => {
    const centerX = 171 + index * 148;
    const centerY = numberPanelY + 145;

    context.fillStyle =
      [COLORS.yellow, COLORS.yellow, COLORS.peach, COLORS.paper, COLORS.caramel][
        index % 5
      ];
    context.beginPath();
    context.arc(centerX, centerY, 48, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = COLORS.cream;
    context.stroke();

    context.textAlign = "center";
    context.fillStyle = index === 4 ? COLORS.paper : COLORS.brown;
    context.font =
      '950 31px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(String(number), centerX, centerY + 11);
  });

  const quoteY = numberPanelY + 270;
  context.fillStyle = "rgba(241, 201, 80, .2)";
  roundedRect(context, 90, quoteY, 900, 150, 28);
  context.fill();

  context.textAlign = "left";
  context.fillStyle = COLORS.brown;
  context.font =
    '900 25px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("🐵 우땅 한마디", 135, quoteY + 45);
  context.font =
    '750 29px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  drawWrappedText(
    context,
    `“${fortune.utangMessage}”`,
    135,
    quoteY + 93,
    805,
    39,
  );

  context.textAlign = "center";
  context.fillStyle = COLORS.brownSoft;
  context.font =
    '800 24px Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("utangland.cloud", CARD_WIDTH / 2, 1285);

  return canvasToBlob(canvas);
}

export function downloadFortuneImage(blob: Blob, date: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = `utang-fortune-${date}.png`;
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
