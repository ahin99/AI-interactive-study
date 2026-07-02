# LexiRecall — 자기주도 법학 백지복습 AI

AI가 정답을 알려주는 튜터가 아니라, 학생이 스스로 설명하고 자신의 오류를 발견하게 돕는 법학(민법총칙) 백지복습 서비스의 공모전 MVP.

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속.

## 시연 흐름

1. 홈(`/`)에서 "시연 시작" 클릭
2. 자료 업로드(`/upload`)에서 "민법총칙 4주차" 샘플 사용 → 분석 시작 → 개념 지도로 이동
3. 개념 지도(`/concept-map`)에서 "통정허위표시" 선택 → 백지복습 시작
4. 백지복습(`/recall`)에서 "예시 답안 넣기" → 제출
5. 피드백(`/feedback`)에서 누락·혼동·이해 검증 질문·다음 복습 단서 확인
6. 지식 지도(`/knowledge-map`)에서 완성률(12%)·메타인지 오차율(67%)·과대평가 개념(2개) 확인

## 현재 범위 (mock 기반 MVP)

- 실제 파일 업로드/PDF 텍스트 추출 없음 (분석 완료는 타이머로 시뮬레이션)
- 실제 AI API 호출 없음 — `src/lib/mock-data.ts`의 `generateMockFeedback`이 개념별 규칙 기반 피드백 생성
  - "통정허위표시"는 공모전 심사용으로 큐레이션된 상세 피드백
  - 그 외 개념은 개념 지도 구조를 활용한 최소 단서형 템플릿 피드백
- 실제 DB 없음 — 상태는 브라우저 `localStorage`(zustand persist)에 저장

## 남은 작업 (실제 서비스로 확장 시)

- [ ] PDF 텍스트 추출 연동 (`pdf-parse` 등)
- [ ] 개념 추출/피드백 생성용 실제 AI API 연동 (`docs/AI_RULES.md`의 규칙을 프롬프트로 반영)
- [ ] Supabase 등 실제 DB/로그인/파일 저장 연동
- [ ] 여러 회차 백지복습 기록 비교(회차별 변화 그래프)
- [ ] 모바일 UI 세부 점검

## 문서

- `CLAUDE.md` — 프로젝트 원칙
- `docs/PRODUCT.md`, `docs/MVP.md`, `docs/AI_RULES.md`, `docs/DATA_MODEL.md`
