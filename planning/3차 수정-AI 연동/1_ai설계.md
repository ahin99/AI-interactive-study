# Lexirecall Gemini AI 연동 설계

작성일: 2026-07-02

## 목표

현재 `lexirecall`은 `src/lib/mock-data.ts`의 mock 데이터와 `generateMockWeekFeedback`으로 시연된다. 다음 단계에서는 Gemini API 무료 티어를 사용해 아래 세 기능을 실제 AI 호출로 교체한다.

1. 자료 입력 후 개념 지도 생성
2. 백지복습 답안 피드백 생성 및 내부 채점
3. 소크라테스식 이해 검증 질문 생성 및 학생 답변 검증

1, 2, 3 번에 각각 사용하는 프롬프트는 따로 정리해서 prompt.md 문서로 정리해줘.

핵심 원칙은 기존 `docs/AI_RULES.md`를 따른다. AI는 정답 제공자가 아니라 최소 단서 제공자다. 따라서 사용자에게 장문 해설이나 완성 답안을 보여주지 않고, 내부 판단 결과를 바탕으로 누락 단서, 혼동 단서, 질문, 다음 복습 방향만 제공한다.

## 공식 문서 기준

- Gemini API 시작: https://ai.google.dev/gemini-api/docs/get-started
- Gemini API 가격/무료 티어: https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limit: https://ai.google.dev/gemini-api/docs/rate-limits
- PDF/document 처리: https://ai.google.dev/gemini-api/docs/document-processing
- 구조화 출력: https://ai.google.dev/gemini-api/docs/structured-output
- Safety settings: https://ai.google.dev/gemini-api/docs/safety-settings

Google 공식 문서 기준으로 JavaScript SDK는 `@google/genai`를 사용한다. API 키는 Google AI Studio에서 발급하고 서버 환경변수 `GEMINI_API_KEY`로 주입한다. 무료 티어는 모델별 제한과 프로젝트별 rate limit이 있으므로, 실제 제한값은 AI Studio의 active rate limits 화면에서 확인해야 한다. 무료 티어 입력 데이터는 Google의 제품 개선에 사용될 수 있으므로, 시연 단계에서도 민감한 개인정보나 시험 답안 원문을 그대로 넣지 않는 정책이 필요하다.

## 추천 모델

초기 MVP 추천:

- 기본 모델: `gemini-3.5-flash`
- 이유: 공식 시작 문서의 기본 예시 모델이고, 법학 자료 분석/피드백/질문 생성처럼 지연 시간과 비용이 중요한 작업에 적합하다.
- 대안: 무료 티어 제한에 걸리거나 응답 품질이 부족하면 같은 클라이언트 래퍼 안에서 모델명을 환경변수로 바꿀 수 있게 한다.

환경변수:

```bash
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3.5-flash"
```

## 설치와 기본 구조

설치:

```bash
npm install @google/genai zod
```

권장 파일 구조:

```text
src/lib/ai/
  gemini-client.ts
  schemas.ts
  prompts.ts
  analyze-material.ts
  grade-recall.ts
  verify-socratic.ts

src/app/api/ai/
  analyze-material/route.ts
  grade-recall/route.ts
  verify-socratic/route.ts
```

클라이언트 컴포넌트에서 Gemini를 직접 호출하면 API 키가 노출된다. 반드시 Next.js Route Handler 또는 서버 액션 안에서 호출한다.

기본 클라이언트 래퍼:

```ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

export const gemini = new GoogleGenAI({ apiKey });
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
```

모든 AI 호출은 다음 공통 규칙을 적용한다.

- `response_format.mime_type`은 `application/json`으로 고정한다.
- Zod 스키마로 응답을 검증한다.
- JSON 파싱 실패 시 1회만 재시도한다.
- 실패하면 현재 mock 생성기로 fallback한다.
- API 키는 `.env.local`에만 두고 커밋하지 않는다.
- 무료 티어 rate limit을 고려해 같은 자료에 대한 분석 결과는 저장한다.

## 기능 1: 자료 분석 후 개념 지도 생성

### 입력

자료 업로드 화면에서 받은 PDF 또는 텍스트 자료.

초기 구현 선택:

- 작은 PDF: Route Handler에서 파일을 받아 base64로 Gemini에 inline 전달
- 큰 PDF 또는 여러 번 참조할 자료: Files API 사용

Gemini는 PDF를 문서로 직접 처리할 수 있고, 텍스트뿐 아니라 표/도식/이미지 맥락도 분석할 수 있다. 1000페이지까지 문서 맥락을 처리할 수 있지만, 무료 티어에서는 대형 자료를 자주 보내면 제한에 빨리 걸릴 수 있다.

### 출력 타입

현재 앱 타입과 맞추기 위해 다음 형태로 받는다.

```ts
type AnalyzeMaterialAIResult = {
  subjectName: string;
  weekNumber: number;
  weekTitle: string;
  concepts: {
    title: string;
    type: "main_concept" | "statute" | "requirement" | "effect" | "exception" | "case" | "comparison";
    description: string;
    sourceExcerpt: string;
    parentTitle?: string;
    importance: 1 | 2 | 3;
  }[];
  outline: {
    label: string;
    conceptTitles: string[];
  }[];
  keywords: [string, string, string];
};
```

앱 저장 시 변환:

- `concepts[]` -> `WeekConcept[]`
- `outline[]` -> 백지복습 목차 난이도 표시용
- `keywords` -> `mockWeekKeywords`를 대체하는 DB 필드
- 각 개념별 초기 `ConceptMapTile`은 `unreviewed`, `metacognitionGap: null`

### 프롬프트

```text
너는 법학 학습 자료를 Lexirecall의 개념 지도로 변환하는 분석기다.

규칙:
- 학생에게 정답 해설을 제공하지 않는다.
- 자료에 나온 개념만 추출한다. 추론으로 새로운 법리를 추가하지 않는다.
- 시험 답안처럼 완성된 설명을 쓰지 말고, 개념 지도에 필요한 짧은 설명만 쓴다.
- 개념은 16주차 지도 안의 한 주차에 배치될 수 있는 단위로 쪼갠다.
- 조문, 요건, 효과, 예외, 판례, 비교개념을 구분한다.
- 각 개념의 근거가 되는 자료 문장을 sourceExcerpt에 짧게 남긴다.

입력:
- 과목명: {{subjectName}}
- 주차: {{weekNumber}}
- 자료 파일명: {{fileName}}
- 자료 내용 또는 PDF 문서: {{material}}

반환:
- 지정된 JSON 스키마만 반환한다.
```

### API 라우트

`POST /api/ai/analyze-material`

요청:

```ts
{
  subjectId?: string;
  subjectName: string;
  weekNumber: number;
  fileName: string;
  mimeType: string;
  fileBase64?: string;
  plainText?: string;
}
```

응답:

```ts
{
  ok: true;
  data: AnalyzeMaterialAIResult;
}
```

### UI 연결

`src/app/upload/page.tsx`에서 현재 샘플 선택 후 mock 분석처럼 보이는 부분을 다음 순서로 교체한다.

1. 파일 선택
2. `POST /api/ai/analyze-material`
3. 반환된 개념/키워드/주차 정보를 저장
4. 과목 상세 `/subjects/[subjectId]`로 이동

시연 단계에서 DB가 없으면 Zustand persist에 저장해도 된다. 다만 실제 서비스형으로 가려면 Supabase 또는 SQLite/Prisma 같은 저장소가 필요하다.

## 기능 2: 백지복습 답안 피드백 및 내부 채점

### 입력

- 과목명
- 주차 제목
- 주차 개념 목록
- 학생이 개념 체크에서 “안다”고 표시한 개념
- 백지복습 난이도
- 학생 답안
- 이전 복습 기록 요약

### 출력 타입

현재 `WeekFeedbackResult`와 맞춘다.

```ts
type GradeRecallAIResult = {
  answerBlocks: {
    text: string;
    highlights: {
      phrase: string;
      status: "misconception" | "partial" | "complete";
      hint: string;
    }[];
  }[];
  missingHints: string[];
  verificationQuestions: {
    type: "reason" | "boundary" | "comparison" | "application" | "premise";
    question: string;
    targetConceptTitles: string[];
    hiddenRubric: string;
  }[];
  nextReviewHint: string;
  statusByConceptTitle: Record<string, "unreviewed" | "not_recalled" | "misconception" | "partial" | "complete">;
  metacognition: {
    overestimatedConceptTitles: string[];
    shortReason: string;
  };
};
```

`hiddenRubric`은 서버에만 저장하거나 즉시 다음 검증 호출에 넘기고, 학생 UI에는 보여주지 않는다.

### 프롬프트

```text
너는 Lexirecall의 법학 백지복습 피드백 엔진이다.

절대 규칙:
- 정답 해설을 길게 제공하지 않는다.
- 학생 답안을 대신 완성하지 않는다.
- 조문/판례 내용을 새로 강의하지 않는다.
- 학생이 직접 자료를 다시 찾도록 누락 단서와 질문만 제공한다.

채점 기준:
- complete: 핵심 요건/효과/예외를 정확히 설명함
- partial: 방향은 맞지만 핵심 요건, 효과, 예외 중 일부 누락
- misconception: 틀린 법률효과, 반대 개념과 혼동, 예외를 일반 원칙처럼 서술
- not_recalled: 답안에 사실상 없음
- unreviewed: 이번 답안 판단 범위 밖

작업:
1. 학생 답안을 줄 단위로 나눈다.
2. 각 줄에서 문제가 있는 phrase를 표시한다.
3. 각 phrase 바로 아래에 보여줄 짧은 피드백 hint를 만든다.
4. 누락된 내용 단서를 만든다. 정답 문장 대신 찾아볼 개념명과 쟁점만 준다.
5. 소크라테스식 이해 검증 질문 3개를 만든다.
6. 학생이 안다고 체크했지만 답안 상태가 complete가 아닌 개념을 overestimated로 표시한다.

입력:
- 과목명: {{subjectName}}
- 주차: {{weekTitle}}
- 개념 목록: {{concepts}}
- 학생 자기평가: {{selfAssessments}}
- 난이도: {{difficulty}}
- 학생 답안: {{answerText}}

반환:
- 지정된 JSON 스키마만 반환한다.
```

### API 라우트

`POST /api/ai/grade-recall`

요청:

```ts
{
  subjectId: string;
  weekId: string;
  concepts: WeekConcept[];
  selfAssessments: SelfAssessment[];
  difficulty: "outline" | "keywords" | "blank";
  answerText: string;
  previousRecords?: {
    submittedAt: string;
    nextReviewHint: string;
  }[];
}
```

응답은 `GradeRecallAIResult`를 받아 서버에서 `WeekFeedbackResult`로 변환한다.

현재 교체 지점:

- `src/lib/mock-data.ts`의 `generateMockWeekFeedback`
- `src/lib/demo-store.ts`의 `submitWeekRecall`

초기에는 `submitWeekRecall`에서 직접 AI를 호출하지 말고, 페이지 컴포넌트에서 `/api/ai/grade-recall` 호출 후 store에 결과를 넣는 방식이 안정적이다. Zustand action 내부에서 async fetch를 넣으면 UI 로딩/에러 처리가 흐려진다.

## 기능 3: 소크라테스식 질문 생성 및 학생 답변 검증

이 기능은 두 단계로 나눈다.

### 3-A. 질문 생성

질문 생성은 기능 2의 `grade-recall` 응답에서 같이 생성한다. 질문은 반드시 답을 직접 유도하지 않되, 학생이 경계 조건을 스스로 확인하게 만들어야 한다.

질문 유형:

- `reason`: 왜 그런 요건이 필요한지
- `boundary`: 어느 범위까지 적용되는지
- `comparison`: 비슷한 제도와 어떻게 다른지
- `application`: 짧은 사례에 적용할 수 있는지
- `premise`: 답안이 전제한 명제가 맞는지

### 3-B. 학생 답변 검증

피드백 페이지에서 학생이 질문에 답하면, 결과 저장 전에 `/api/ai/verify-socratic`을 호출한다.

출력 타입:

```ts
type VerifySocraticAIResult = {
  results: {
    questionId: string;
    status: "correct" | "partial" | "incorrect";
    hint: string;
    relatedConceptTitles: string[];
  }[];
  updatedStatusByConceptTitle: Record<string, "unreviewed" | "not_recalled" | "misconception" | "partial" | "complete">;
  finalReviewHint: string;
};
```

### 프롬프트

```text
너는 Lexirecall의 소크라테스식 이해 검증 엔진이다.

규칙:
- 학생 답변의 정오를 내부적으로 판단한다.
- 학생에게는 짧은 hint만 제공한다.
- 정답 해설이나 완성 답안을 제공하지 않는다.
- 질문별 hiddenRubric을 기준으로 판단하되, 표현이 달라도 핵심 논리가 맞으면 correct로 본다.

입력:
- 과목명: {{subjectName}}
- 주차: {{weekTitle}}
- 질문 목록: {{questionsWithHiddenRubric}}
- 학생 답변: {{verificationAnswers}}
- 기존 개념 상태: {{statusByConceptTitle}}

반환:
- 지정된 JSON 스키마만 반환한다.
```

### UI 연결

현재 피드백 화면은 질문 3개에 모두 답하면 `결과 저장`이 가능하다. 다음처럼 바꾼다.

1. `결과 저장` 클릭
2. `/api/ai/verify-socratic` 호출
3. 질문 답변 검증 결과와 `updatedStatusByConceptTitle` 수신
4. 기존 `currentWeekFeedback.statusByConceptId`에 반영
5. `saveRecallRecord()`
6. 주차 상세 페이지로 이동

무료 티어 절약을 위해 초기 버전에서는 질문 답변 검증을 생략하고, 기능 2의 피드백만 저장해도 된다. 다만 최종 기획에는 3-B까지 포함하는 것이 맞다.

## 공통 JSON 스키마 예시

Gemini의 structured output은 JSON Schema 일부를 지원한다. 실제 구현에서는 Zod 스키마를 정의하고, Gemini에 넘길 JSON Schema와 런타임 검증을 같은 기준으로 맞춘다.

예시:

```ts
import { z } from "zod";

export const KnowledgeStatusSchema = z.enum([
  "unreviewed",
  "not_recalled",
  "misconception",
  "partial",
  "complete",
]);

export const VerificationQuestionSchema = z.object({
  type: z.enum(["reason", "boundary", "comparison", "application", "premise"]),
  question: z.string(),
  targetConceptTitles: z.array(z.string()),
  hiddenRubric: z.string(),
});

export const GradeRecallSchema = z.object({
  answerBlocks: z.array(z.object({
    text: z.string(),
    highlights: z.array(z.object({
      phrase: z.string(),
      status: z.enum(["misconception", "partial", "complete"]),
      hint: z.string(),
    })),
  })),
  missingHints: z.array(z.string()),
  verificationQuestions: z.array(VerificationQuestionSchema).length(3),
  nextReviewHint: z.string(),
  statusByConceptTitle: z.record(z.string(), KnowledgeStatusSchema),
  metacognition: z.object({
    overestimatedConceptTitles: z.array(z.string()),
    shortReason: z.string(),
  }),
});
```

## 서버 호출 예시

```ts
const interaction = await gemini.interactions.create({
  model: GEMINI_MODEL,
  input: prompt,
  response_format: {
    type: "text",
    mime_type: "application/json",
    schema: gradeRecallJsonSchema,
  },
});

const parsed = GradeRecallSchema.parse(JSON.parse(interaction.output_text));
```

PDF를 같이 보낼 때:

```ts
const interaction = await gemini.interactions.create({
  model: GEMINI_MODEL,
  input: [
    { type: "text", text: prompt },
    {
      type: "document",
      data: fileBase64,
      mime_type: "application/pdf",
    },
  ],
  response_format: {
    type: "text",
    mime_type: "application/json",
    schema: analyzeMaterialJsonSchema,
  },
});
```

## 에러 처리

필수 처리:

- `429 RESOURCE_EXHAUSTED`: 무료 티어 제한. 사용자에게 “잠시 후 다시 시도” 안내, 기존 mock 또는 마지막 분석 결과 표시
- JSON 파싱 실패: 같은 입력으로 1회 재시도. 재시도 프롬프트에는 “이전 응답은 JSON이 아니었음. 스키마만 반환” 추가
- 안전 필터 또는 빈 응답: AI 결과 없음 상태를 표시하고 사용자가 직접 다시 시도
- 파일 처리 실패: 파일 형식/용량 안내

Route Handler 응답 형식:

```ts
type AiApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: "RATE_LIMIT" | "INVALID_JSON" | "SAFETY_BLOCKED" | "FILE_ERROR" | "UNKNOWN"; message: string };
```

## 데이터 저장 설계

DB 도입 전:

- `useDemoStore`에 AI 분석 결과 저장
- 새로고침 유지가 필요하면 Zustand persist 사용
- 같은 파일명/주차에 대한 분석 결과는 재사용

DB 도입 후 권장 테이블:

- `subjects`
- `study_weeks`
- `week_materials`
- `week_concepts`
- `map_snapshots`
- `recall_records`
- `week_feedback_results`
- `verification_results`
- `ai_call_logs`

`ai_call_logs`에는 다음을 저장한다.

- 기능명: `analyze_material`, `grade_recall`, `verify_socratic`
- 모델명
- 입력 토큰/출력 토큰
- 성공 여부
- 오류 코드
- 생성일

학생 답안 원문과 자료 원문은 민감 정보가 될 수 있으므로 로그에 그대로 저장하지 않는다. 필요하면 해시 또는 짧은 요약만 저장한다.

## 구현 순서

1. `@google/genai`, `zod` 설치
2. `.env.local`에 `GEMINI_API_KEY`, `GEMINI_MODEL` 추가
3. `src/lib/ai/gemini-client.ts` 작성
4. `src/lib/ai/schemas.ts` 작성
5. `src/lib/ai/prompts.ts` 작성
6. `/api/ai/grade-recall` 먼저 구현
7. `generateMockWeekFeedback` 호출부를 AI API 호출로 교체
8. 실패 시 mock fallback 유지
9. `/api/ai/analyze-material` 구현
10. 업로드 화면에서 분석 결과를 저장하도록 연결
11. `/api/ai/verify-socratic` 구현
12. 결과 저장 버튼에서 검증 후 저장하도록 연결
13. AI Studio에서 무료 티어 rate limit과 사용량 확인

## MVP에서 먼저 붙일 기능

우선순위는 다음이 가장 현실적이다.

1. 백지복습 답안 피드백
2. 소크라테스식 질문 검증
3. 자료 분석 후 개념 지도 생성

이유:

- 답안 피드백은 현재 mock 함수 하나를 교체하면 사용자 체감 변화가 가장 크다.
- 질문 검증은 피드백 저장 직전에 붙이면 된다.
- 자료 분석은 파일 업로드, PDF 처리, 저장 구조까지 함께 바뀌므로 범위가 크다.

## 보안 및 운영 주의

- Gemini API 키는 클라이언트 번들에 포함되면 안 된다.
- API Route에서 사용자 입력 길이를 제한한다.
- 무료 티어에서는 rate limit이 프로젝트 단위로 적용된다.
- 반복 클릭 방지를 위해 버튼 로딩 상태와 idempotency key를 둔다.
- 사용자가 업로드한 자료가 개인정보/타인 저작물/시험 문제 원문일 수 있으므로, 약관 안내와 삭제 기능이 필요하다.
- 무료 티어 데이터 사용 정책 때문에 실제 사용자 데이터를 받을 단계에서는 유료 티어 또는 별도 데이터 처리 정책 검토가 필요하다.

## 완료 기준

- `.env.local`에 Gemini 키를 넣으면 백지복습 피드백이 Gemini 응답으로 생성된다.
- Gemini 응답은 항상 Zod 검증을 통과한 뒤 UI에 들어간다.
- 실패해도 앱이 멈추지 않고 mock fallback 또는 사용자 안내를 제공한다.
- 피드백 UI에는 정답 해설이 아니라 줄별 피드백, 누락 단서, 복습 제안, 이해 검증 질문만 표시된다.
- 자료 분석 결과는 16주차 개념 지도 구조에 들어갈 수 있는 `WeekConcept`와 `MapSnapshot`으로 변환된다.
