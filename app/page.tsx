import Link from "next/link";

import { AuthMenu } from "@/components/auth/AuthMenu";
import { FortuneExperience } from "@/components/fortune/FortuneExperience";

const instagramUrl =
  "https://www.instagram.com/utang.co?igsh=aWlqMWl5NTVsZG1m";

const moments = [
  {
    number: "01",
    emoji: "🎵",
    image: "/images/utang-dance.png",
    imageAlt: "신나게 춤추는 우땅이",
    title: "신나면 몸부터",
    text: "좋은 일이 생기면 팔도 다리도 가만있지 못해요. 우땅이의 신나는 몸짓은 보는 사람까지 웃게 해요.",
  },
  {
    number: "02",
    emoji: "💗",
    image: "/images/utang-heart.png",
    imageAlt: "커다란 하트와 함께 있는 우땅이",
    title: "좋아하는 마음은 크게",
    text: "친구를 좋아하는 마음도, 고마운 마음도 숨기지 않아요. 우땅이는 다정함을 아낌없이 건네요.",
  },
  {
    number: "03",
    emoji: "🌼",
    image: "/images/utang-flower.png",
    imageAlt: "노란 꽃을 건네는 우땅이",
    title: "다정함은 슬쩍",
    text: "별일 없는 날에도 작은 꽃 한 송이처럼 마음을 건네요. 평범한 하루가 조금 따뜻해지는 순간이에요.",
  },
];

const expressions = [
  {
    image: "/images/utang-cheer.png",
    imageAlt: "두 팔을 들고 신나게 응원하는 우땅이",
    label: "같이 신나숭!",
  },
  {
    image: "/images/utang-party.png",
    imageAlt: "고깔모자를 쓰고 북을 치는 우땅이",
    label: "오늘은 축제숭!",
  },
  {
    image: "/images/utang-sparkle.png",
    imageAlt: "눈을 반짝이며 감탄하는 우땅이",
    label: "반짝이는 날",
  },
  {
    image: "/images/utang-stretch.png",
    imageAlt: "두 팔을 높이 들고 기지개를 켜는 우땅이",
    label: "쭉— 기지개!",
  },
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="우땅랜드 메인 페이지 맨 위로"
        >
          <span className="brand-sun" aria-hidden="true">
            <img src="/images/utang-sun.png" alt="" />
          </span>
          <span className="brand-copy">
            <strong>UTANGLAND</strong>
            <small>우땅이 팬페이지</small>
          </span>
        </a>

        <nav aria-label="주요 메뉴">
          <a href="#hello">우땅이</a>
          <a href="#expressions">표정</a>
          <Link href="/community">광장</Link>
          <AuthMenu />
          <a
            className="nav-cta"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>HELLO, UTANG!</span>
            오늘도 우다다
          </p>

          <h1 id="hero-title">
            웃음이 필요한 순간,
            <br />
            우땅이가 <em>달려와!</em>
          </h1>

          <p className="hero-description">
            엉뚱한 표정과 다정한 마음으로 평범한 하루를 즐겁게 바꾸는
            원숭이 친구, 우땅이를 만나보세요.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#hello">
              우땅이 만나기
              <span aria-hidden="true">↓</span>
            </a>
            <FortuneExperience />
            <Link className="community-button" href="/community">
              <span aria-hidden="true">🌳</span>
              우땅 광장 가기
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="웃고 있는 우땅이 캐릭터">
          <div className="sun-shape" aria-hidden="true" />
          <div className="scribble" aria-hidden="true">우다다!</div>

          <div className="portrait-card">
            <img src="/utang-profile.png" alt="활짝 웃고 있는 우땅이" />
          </div>

          <img
            className="hero-dance-sticker"
            src="/images/utang-dance.png"
            alt=""
            aria-hidden="true"
          />

          <div className="hero-sticker" aria-hidden="true">
            <span>표정도 마음도</span>
            <strong>진심 100%</strong>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div>
          <span>UTANG IS RUNNING</span><i>🐵</i>
          <span>오늘도 우다다</span><i>🌼</i>
          <span>UTANG IS RUNNING</span><i>💛</i>
          <span>오늘도 우다다</span><i>🐵</i>
        </div>
      </div>

      <section className="hello-section" id="hello" aria-labelledby="hello-title">
        <div className="section-label">
          <span>ABOUT UTANG</span>
          <b>01</b>
        </div>

        <div className="hello-grid">
          <div className="hello-title-wrap">
            <p className="tiny-note">만나서 반가워!</p>
            <h2 id="hello-title">안녕,<br />나는 우땅이야.</h2>

            <div className="hello-character" aria-hidden="true">
              <span>어서 와숭!</span>
              <img src="/images/utang-flower.png" alt="" />
            </div>
          </div>

          <div className="hello-story">
            <p className="lead">
              우땅이는 마음 가는 대로 움직이고,
              <strong> 좋아하는 마음은 솔직하게 표현하는 친구</strong>예요.
            </p>

            <p>
              신나면 온몸으로 춤추고, 속상하면 눈물을 참지 않아요. 조금은
              엉뚱하고 가끔은 서툴러도 친구를 생각하는 마음만큼은 누구보다
              따뜻하답니다.
            </p>

            <p>
              우땅랜드에서는 우땅이의 여러 표정과 이야기를 만나고, 오늘의
              운세를 뽑거나 광장에서 다른 주민들과 이야기를 나눌 수 있어요.
            </p>

            <dl className="profile-list">
              <div><dt>NAME</dt><dd>우땅이 🐵</dd></div>
              <div><dt>PERSONALITY</dt><dd>엉뚱함, 솔직함, 다정함</dd></div>
              <div><dt>FAVORITE</dt><dd>친구와 함께 신나게 놀기</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section
        className="expression-section"
        id="expressions"
        aria-labelledby="expression-title"
      >
        <div className="section-label">
          <span>UTANG EXPRESSIONS</span>
          <b>02</b>
        </div>

        <div className="expression-heading">
          <div>
            <p className="tiny-note">오늘 기분은 어때?</p>
            <h2 id="expression-title">표정만 봐도<br />마음이 보여!</h2>
          </div>
          <p>
            기쁘면 활짝, 놀라면 동그랗게. 꾸밈없이 솔직한 우땅이의
            표정을 골라보세요.
          </p>
        </div>

        <div className="expression-grid">
          {expressions.map((expression) => (
            <figure className="expression-card" key={expression.image}>
              <img
                src={expression.image}
                alt={expression.imageAlt}
                loading="lazy"
              />
              <figcaption>{expression.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="moments-section" id="moments" aria-labelledby="moments-title">
        <div className="section-label light">
          <span>UTANG MOMENTS</span>
          <b>03</b>
        </div>

        <div className="moments-heading">
          <h2 id="moments-title">한 장면만 봐도 우땅이답게</h2>
          <p>우땅이의 표정과 몸짓에는 솔직한 마음이 그대로 담겨 있어요.</p>
        </div>

        <div className="moment-grid">
          {moments.map((moment) => (
            <article className="moment-card" key={moment.number}>
              <div className="moment-top">
                <span className="moment-number">MOMENT {moment.number}</span>
                <span className="moment-emoji" aria-hidden="true">{moment.emoji}</span>
              </div>
              <div className="moment-visual">
                <img src={moment.image} alt={moment.imageAlt} loading="lazy" />
              </div>
              <div className="moment-copy">
                <h3>{moment.title}</h3>
                <p>{moment.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="meet-section" aria-labelledby="meet-title">
        <div className="meet-copy">
          <p className="eyebrow">
            <span>MORE UTANG!</span>
            우땅이의 다음 장면
          </p>

          <h2 id="meet-title">더 많은 표정과 이야기는<br />인스타그램에서!</h2>

          <p>
            우땅이의 새로운 그림과 소식은 원작자 소콘소콘의 공식
            인스타그램에서 가장 먼저 만날 수 있어요.
          </p>

          <a className="primary-button dark" href={instagramUrl} target="_blank" rel="noreferrer">
            @utang.co 구경하기
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="meet-visual">
          <div className="speech-bubble" aria-hidden="true">좋아해줘서<br />고마어!</div>
          <img
            src="/images/utang-heart.png"
            alt="커다란 하트와 함께 인사하는 우땅이"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
}
