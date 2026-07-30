import type { Fortune } from "./fortuneTypes";

export const FORTUNES = [
  {
    id: "tiny-courage",
    title: "작은 용기가 반짝이는 날",
    message:
      "평소 망설였던 일을 아주 조금만 시작해 보세요. 첫걸음 뒤에는 생각보다 즐거운 길이 기다리고 있어요.",
    luckyColor: "햇살 노랑",
    luckyAction: "미뤄둔 일 10분 시작하기",
    acorn: "황금 도토리",
    utangMessage: "도토리도 처음엔 작은 한 알이었어. 오늘은 네가 먼저 한 걸음!",
  },
  {
    id: "slow-and-steady",
    title: "천천히 가도 좋은 날",
    message:
      "서두르지 않아도 괜찮아요. 오늘은 속도보다 방향을 살피면 놓쳤던 좋은 마음을 발견할 수 있어요.",
    luckyColor: "크림 베이지",
    luckyAction: "따뜻한 차 한 잔 마시기",
    acorn: "포근한 도토리",
    utangMessage: "우다다도 좋지만 가끔은 사뿐사뿐이 더 멀리 데려다줘.",
  },
  {
    id: "friendly-hello",
    title: "먼저 건넨 인사가 행운이 되는 날",
    message:
      "짧은 인사와 작은 친절이 예상보다 큰 웃음으로 돌아와요. 반가운 마음을 숨기지 마세요.",
    luckyColor: "살구 주황",
    luckyAction: "먼저 안부 묻기",
    acorn: "다정한 도토리",
    utangMessage: "안녕 한마디면 우리 사이에 작은 숲길이 생겨!",
  },
  {
    id: "fresh-idea",
    title: "엉뚱한 생각이 답이 되는 날",
    message:
      "평범한 방법이 막힌다면 조금 장난스러운 방향으로 바라보세요. 오늘의 기발함은 꽤 쓸모가 있어요.",
    luckyColor: "새싹 연두",
    luckyAction: "떠오른 생각 바로 적기",
    acorn: "엉뚱한 도토리",
    utangMessage: "길이 없으면 데구르르 굴러서 새 길을 만들면 되지!",
  },
  {
    id: "good-news",
    title: "반가운 소식이 가까이 온 날",
    message:
      "기다리던 답이나 뜻밖의 연락이 찾아올 수 있어요. 알림을 확인하기 전에 기분 좋은 기대를 품어보세요.",
    luckyColor: "하늘 파랑",
    luckyAction: "고마운 사람에게 답장하기",
    acorn: "소식 도토리",
    utangMessage: "좋은 소식은 발소리가 작아. 귀를 쫑긋 세워보자!",
  },
  {
    id: "rest-is-luck",
    title: "잘 쉬는 것이 행운인 날",
    message:
      "오늘의 빈틈은 게으름이 아니라 충전 시간이에요. 잠깐 멈추면 마음이 다시 가볍게 달릴 준비를 해요.",
    luckyColor: "구름 흰색",
    luckyAction: "화면을 끄고 15분 쉬기",
    acorn: "낮잠 도토리",
    utangMessage: "나무도 밤에는 쉬어. 오늘의 쉼표를 꼭 챙겨!",
  },
  {
    id: "small-discovery",
    title: "가까운 곳에서 보물을 찾는 날",
    message:
      "멀리 가지 않아도 새로운 즐거움이 숨어 있어요. 익숙한 길을 천천히 둘러보면 작은 보물이 보여요.",
    luckyColor: "숲속 초록",
    luckyAction: "동네 한 바퀴 산책하기",
    acorn: "탐험 도토리",
    utangMessage: "보물은 반짝이기보다 조용히 기다리는 경우가 더 많아!",
  },
  {
    id: "confident-choice",
    title: "내 선택을 믿어도 좋은 날",
    message:
      "여러 목소리 사이에서 가장 오래 마음에 남는 생각을 따라가세요. 오늘의 직감은 꽤 정확한 편이에요.",
    luckyColor: "카라멜 브라운",
    luckyAction: "첫 번째 마음을 존중하기",
    acorn: "용기 도토리",
    utangMessage: "네 마음이 고른 길이라면 우땅이가 신나게 응원할게!",
  },
  {
    id: "happy-accident",
    title: "뜻밖의 일이 웃음이 되는 날",
    message:
      "계획과 조금 다르게 흘러가도 당황하지 마세요. 예상 밖의 장면이 오늘의 가장 재미있는 추억이 될 수 있어요.",
    luckyColor: "복숭아 분홍",
    luckyAction: "계획에 여백 하나 남기기",
    acorn: "우다다 도토리",
    utangMessage: "넘어져도 데구르르 한 바퀴 돌면 멋진 묘기가 되지!",
  },
  {
    id: "finish-line",
    title: "마무리에서 빛나는 날",
    message:
      "새로운 시작보다 손에 쥔 일을 하나 끝내보세요. 마지막 점을 찍는 순간 마음에도 시원한 바람이 불어요.",
    luckyColor: "노을 주황",
    luckyAction: "작은 일 하나 완성하기",
    acorn: "완성 도토리",
    utangMessage: "마지막 도토리 한 알까지 담으면 바구니가 든든해져!",
  },
  {
    id: "share-a-smile",
    title: "웃음을 나눌수록 커지는 날",
    message:
      "재미있는 이야기와 귀여운 사진을 혼자 간직하지 마세요. 오늘은 함께 웃을 때 행운도 두 배가 돼요.",
    luckyColor: "레몬 노랑",
    luckyAction: "재미있는 사진 공유하기",
    acorn: "웃음 도토리",
    utangMessage: "웃음은 나눠도 줄지 않고 더 커진대. 정말 신기하지?",
  },
  {
    id: "gentle-heart",
    title: "나에게 다정해야 하는 날",
    message:
      "잘하지 못한 것보다 애쓴 마음을 먼저 바라봐 주세요. 오늘만큼은 스스로에게 가장 따뜻한 친구가 되어주세요.",
    luckyColor: "라일락 보라",
    luckyAction: "오늘 잘한 일 세 가지 적기",
    acorn: "마음 도토리",
    utangMessage: "오늘도 여기까지 온 너, 이미 아주 잘하고 있어!",
  },
] as const satisfies readonly Fortune[];

const fallbackFortune = FORTUNES[0];

export function getFortuneById(id: string | undefined): Fortune {
  return FORTUNES.find((fortune) => fortune.id === id) ?? fallbackFortune;
}

export const FORTUNE_IDS = new Set(FORTUNES.map((fortune) => fortune.id));
