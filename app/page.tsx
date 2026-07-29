import { AuthMenu } from "@/components/auth/AuthMenu";
import { FortuneExperience } from "@/components/fortune/FortuneExperience";

const instagramUrl =
  "https://www.instagram.com/utang.co?igsh=aWlqMWl5NTVsZG1m";

const moments = [
  {
    number: "01",
    emoji: "💛",
    title: "마음을 말랑하게",
    text: "짧은 한마디와 엉뚱한 몸짓으로 바쁜 하루에 작은 웃음을 건네요.",
  },
  {
    number: "02",
    emoji: "☂️",
    title: "친구를 다정하게",
    text: "비 오는 날엔 우산을, 생일에는 축하를. 우땅이는 늘 친구를 먼저 챙겨요.",
  },
  {
    number: "03",
    emoji: "🐵",
    title: "오늘도 우다다",
    text: "가만히 있기엔 세상이 너무 재미있으니까, 오늘도 신나게 우다다 달려가요.",
  },
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="우땅이 소개 페이지 맨 위로"
        >
          <span className="brand-face" aria-hidden="true">
            ●ᴥ●
          </span>
          <span>UTANG</span>
        </a>

        <nav aria-label="주요 메뉴">
          <a href="#hello">소개</a>
          <a href="#moments">매력</a>

          <AuthMenu />

          <a
            className="nav-cta"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>HELLO!</span>
            우다다 우땅이
          </p>

          <h1 id="hero-title">
            엉뚱해서 웃기고,
            <br />
            다정해서 <em>좋아.</em>
          </h1>

          <p className="hero-description">
            매일의 작은 순간을 신나는 몸짓과 따뜻한 한마디로 바꾸는 원숭이
            친구, 우땅이를 소개합니다.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#hello">
              우땅이 만나기
              <span aria-hidden="true">↓</span>
            </a>
            <FortuneExperience />
            <a
              className="text-link"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              @utang.co 구경하기
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-label="우땅이 캐릭터 사진">
          <div className="sun-shape" aria-hidden="true" />

          <div className="scribble" aria-hidden="true">
            우다다!
          </div>

          <div className="portrait-card">
            <img
              src="/utang-profile.png"
              alt="활짝 웃고 있는 우땅이 캐릭터"
            />
          </div>

          <div className="hero-sticker" aria-hidden="true">
            <span>오늘도</span>
            <strong>신나게!</strong>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div>
          <span>UTANG IS RUNNING</span>
          <i>★</i>
          <span>우다다 우땅이</span>
          <i>★</i>
          <span>UTANG IS RUNNING</span>
          <i>★</i>
          <span>우다다 우땅이</span>
          <i>★</i>
        </div>
      </div>

      <section
        className="hello-section"
        id="hello"
        aria-labelledby="hello-title"
      >
        <div className="section-label">
          <span>ABOUT</span>
          <b>01</b>
        </div>

        <div className="hello-grid">
          <div className="hello-title-wrap">
            <p className="tiny-note">만나서 반가워!</p>

            <h2 id="hello-title">
              안녕,
              <br />
              나는 우땅이야.
            </h2>
          </div>

          <div className="hello-story">
            <p className="lead">
              우땅이는 재미있는 일이라면 어디든 달려가는
              <strong> 작고 유쾌한 원숭이</strong>예요.
            </p>

            <p>
              친구와 함께라면 데구르르 굴러도, 비를 만나도 괜찮아요. 생일을
              축하하고 우산을 챙기라고 말해주는 우땅이의 하루에는 장난기만큼
              다정함도 가득하답니다.
            </p>

            <dl className="profile-list">
              <div>
                <dt>NAME</dt>
                <dd>우땅이</dd>
              </div>

              <div>
                <dt>ENERGY</dt>
                <dd>우다다 100%</dd>
              </div>

              <div>
                <dt>FAVORITE</dt>
                <dd>친구와 함께 놀기</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        className="moments-section"
        id="moments"
        aria-labelledby="moments-title"
      >
        <div className="section-label light">
          <span>CHARM POINTS</span>
          <b>02</b>
        </div>

        <div className="moments-heading">
          <h2 id="moments-title">우땅이와 함께하면</h2>

          <p>평범한 하루도 조금 더 재미있고 따뜻해져요.</p>
        </div>

        <div className="moment-grid">
          {moments.map((moment) => (
            <article className="moment-card" key={moment.number}>
              <div className="moment-top">
                <span className="moment-number">{moment.number}</span>

                <span className="moment-emoji" aria-hidden="true">
                  {moment.emoji}
                </span>
              </div>

              <h3>{moment.title}</h3>
              <p>{moment.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="meet-section" aria-labelledby="meet-title">
        <div className="meet-copy">
          <p className="eyebrow">
            <span>LET&apos;S GO!</span>
            더 많은 우땅이
          </p>

          <h2 id="meet-title">
            우리, 인스타그램에서
            <br />
            또 만나자!
          </h2>

          <p>
            우땅이의 우다다 일상과 새로운 소식을 가장 먼저 만나보세요.
          </p>

          <a
            className="primary-button dark"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            @utang.co 팔로우하기
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="meet-visual" aria-hidden="true">
          <div className="speech-bubble">
            고마어
            <br />
            같이가!
          </div>

          <img src="/utang-profile.png" alt="" />
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span aria-hidden="true">●ᴥ●</span>
          UTANG
        </a>

        <p>작고 엉뚱하고 다정한 친구, 우땅이</p>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
        >
          Instagram ↗
        </a>
      </footer>
    </main>
  );
}
