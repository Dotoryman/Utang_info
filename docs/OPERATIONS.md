# UtangLand 운영 체크리스트

## 배포 전

1. `git status`로 의도하지 않은 변경이 없는지 확인합니다.
2. `npm run check`로 코드 검사, 빌드, 단위 테스트를 통과시킵니다.
3. 스키마가 바뀌었다면 생성된 Drizzle migration SQL을 직접 확인합니다.
4. 운영 D1을 내보내 별도 위치에 보관합니다.

```powershell
npx wrangler d1 export utangland-db --remote --output=./utangland-db-backup.sql
```

5. 스키마가 바뀐 릴리즈에만 운영 migration을 적용합니다.

```powershell
npx wrangler d1 migrations apply utangland-db --remote
```

6. `npm run deploy:check`로 운영 배포 구성을 검사합니다.

## Turnstile 최초 설정

운영 위젯의 허용 도메인은 `utangland.cloud`만 사용합니다. 로컬 주소는 운영
위젯에 넣지 않고 `.dev.vars.example`의 공식 테스트 키를 사용합니다.

```powershell
npx wrangler turnstile widget create "utangland-auth" --domain utangland.cloud --mode managed
npx wrangler secret put TURNSTILE_SITE_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put TURNSTILE_HOSTNAMES
```

`TURNSTILE_HOSTNAMES` 값은 `utangland.cloud`입니다. 실제 비밀 키는 저장소,
명령 인수, 문서 또는 채팅에 남기지 않습니다.

## 배포 후 확인

1. 메인, 광장, 주민증, 우편함, 주민 관리소가 열리는지 확인합니다.
2. 회원가입·로그인·로그아웃과 잘못된 비밀번호 처리를 확인합니다.
3. 게시글과 댓글의 등록·수정·삭제, 좋아요와 알림을 확인합니다.
4. 일반 주민이 관리자 API에 접근할 수 없는지 확인합니다.
5. 404 페이지, 개인정보 처리방침, 이용약관을 확인합니다.
6. 관리자 주민 관리 화면에서 R2 사용량이 제한 이내인지 확인합니다.

## 복구 원칙

- 운영 장애 시 먼저 새 쓰기를 중단하고 원인을 확인합니다.
- D1 복원은 현재 데이터를 덮어쓰므로 복원 직전에도 내보내기를 수행합니다.
- SQL 백업 복원은 별도 검증용 D1에서 먼저 시험한 뒤 운영 DB에 적용합니다.
- R2 객체 삭제는 D1의 `profile_image` 참조 여부를 확인한 뒤 수행합니다.
- 운영에서 직접 수정한 내용은 반드시 코드나 migration에도 반영합니다.

## 정기 점검

- 매주: 관리자 화면의 R2 사용량과 오류 로그
- 매월: D1 내보내기 보관, 오래된 세션과 운영 계정 점검
- 릴리즈마다: 전체 검증, 운영 smoke test, GitHub 릴리즈 노트
