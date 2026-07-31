# UtangLand

우다다 달리는 다정한 원숭이 캐릭터 **우땅이**의 소개와 주민 광장을 담은
Cloudflare 기반 웹서비스입니다.

## 주요 기능

- 우땅이 소개와 우땅점술소 오늘의 운세
- 운세 결과 이미지 저장·공유와 행운 번호
- 이메일 회원가입·로그인, 주민증과 프로필 이미지
- 우땅 광장 게시글·댓글·좋아요·알림
- 관리자 주민·게시글·댓글 관리와 R2 사용량 확인
- 회원 탈퇴와 주민 데이터 일괄 정리

## 기술 구성

- React 19 / TypeScript
- Vinext / Vite
- Cloudflare Workers / D1 / R2 / Turnstile
- Drizzle ORM

## 로컬 실행

```powershell
npm install
npm run dev
```

Turnstile까지 로컬에서 확인하려면 `.dev.vars.example`을 `.dev.vars`로
복사합니다. 예시 파일에는 Cloudflare의 공식 테스트 키만 들어 있습니다.

## 검증

```powershell
npm run check
npm run deploy:check
```

## 데이터베이스

```powershell
npm run db:migrate:local
```

운영 D1 마이그레이션과 배포 전 점검 절차는
[`docs/OPERATIONS.md`](docs/OPERATIONS.md)를 따릅니다.

## 운영 주소

- Website: https://utangland.cloud
- Instagram: https://www.instagram.com/utang.co

## 문서

- [운영 체크리스트](docs/OPERATIONS.md)
- [데이터 구조와 삭제 범위](docs/DATA-MAP.md)
- [개인정보 처리방침](https://utangland.cloud/privacy)
- [이용약관](https://utangland.cloud/terms)
