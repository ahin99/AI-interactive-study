# PDF 업로드 기반 개념지도 분석 개선 설계

작성일: 2026-07-03

## 배경

현재 Lexirecall에는 Gemini 기반 개념지도 분석 API가 구현되어 있다.

- `src/app/api/ai/analyze-material/route.ts`
- `src/lib/ai/gemini-client.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/schemas.ts`
- `src/lib/ai/transforms.ts`
- `src/app/upload/page.tsx`

작은 텍스트 입력은 Gemini까지 정상 호출되고, 개념지도용 JSON도 반환된다. 따라서 문제는 "AI 분석 기능이 없음"이 아니라 "실제 PDF 업로드 자료를 AI에 전달하는 방식이 불안정함"이다.

현재 구현은 브라우저에서 PDF 전체를 base64 문자열로 바꾼 뒤 JSON 요청 body에 넣어 `/api/ai/analyze-material`로 보낸다. 이 방식은 작은 PDF에서는 동작할 수 있지만, 강의자료 PDF처럼 5MB~10MB 이상이 되는 파일에서는 쉽게 실패하거나 분석 중 멈춘 것처럼 보인다.

## 현재 문제

### 1. PDF를 JSON/base64로 통째로 전송함

현재 흐름:

```text
사용자 PDF 선택
-> 브라우저 FileReader가 PDF를 base64 문자열로 변환
-> JSON body에 fileBase64를 넣어 서버로 전송
-> 서버가 Gemini inlineData로 PDF 전달
-> Gemini가 개념지도 JSON 반환
```

문제:

- base64 변환 시 원본보다 약 33% 커진다.
- 서버는 `MAX_BASE64_LENGTH = 10_000_000`으로 제한한다.
- 예: 원본 10.4MB PDF는 base64 변환 후 약 13MB 이상이 되어 제한을 초과한다.
- 브라우저가 큰 파일을 문자열로 들고 있어 메모리와 렌더링도 불안정해질 수 있다.

### 2. 큰 PDF 실패가 사용자에게 명확히 보이지 않음

서버는 크기 초과 시 413 응답을 반환하도록 되어 있지만, 실제 사용자 경험에서는 파일 읽기, JSON 직렬화, 요청 전송 단계가 길어져 "분석 중 멈춤"처럼 보일 수 있다.

### 3. 여러 파일 업로드 문구와 실제 동작이 다름

UI는 여러 파일을 한 주차 개념 지도로 통합한다고 안내하지만, 현재 분석 로직은 `files[0]`만 사용한다. 두 번째 이후 파일은 Gemini 분석에 들어가지 않는다.

### 4. PPT는 실제 내용 분석이 아님

UI에는 PDF, PPT 업로드가 가능하다고 되어 있지만, 현재 코드는 PDF만 `inlineData`로 보낸다. PPT나 기타 파일은 파일명과 표시명만 텍스트로 만들어 Gemini에 전달한다. 따라서 PPT의 실제 슬라이드 내용은 분석되지 않는다.

## 목표

PDF 업로드 기능의 목표는 다음과 같다.

1. 사용자가 주차별 PDF를 업로드하면 실제 PDF 내용을 분석한다.
2. 5MB~20MB 수준의 강의자료 PDF도 안정적으로 처리한다.
3. 여러 PDF를 올리면 한 주차의 개념 구조로 통합한다.
4. 분석 실패 시 사용자가 원인을 이해할 수 있는 메시지를 본다.
5. Gemini 분석 결과는 기존 `AnalyzeMaterialAIResult` 스키마와 `analyzeAiResultToDemoData` 변환 흐름을 유지한다.

## 권장 구조

1차 개선에서는 "서버에서 PDF 텍스트를 추출한 뒤 Gemini에는 텍스트를 보내는 방식"을 권장한다.

권장 흐름:

```text
사용자 PDF 선택
-> FormData/multipart로 서버에 파일 전송
-> 서버에서 PDF 텍스트 추출
-> 추출 텍스트를 파일별/페이지별로 정리
-> 너무 긴 텍스트는 주차 단위 분석에 필요한 길이로 압축 또는 분할
-> Gemini에 텍스트 기반 분석 요청
-> AnalyzeMaterialAIResult 반환
-> Zustand persist에 주차/개념/지도 저장
```

이 방식을 권장하는 이유:

- JSON/base64 크기 문제를 제거한다.
- Gemini에 원본 PDF 바이너리를 매번 보내는 것보다 입력량과 비용을 줄일 수 있다.
- 텍스트 기반 법학 강의자료에는 충분히 적합하다.
- 현재 스키마와 프롬프트 구조를 크게 바꾸지 않아도 된다.

## 대안 비교

### 대안 A: base64 제한만 늘리기

내용:

- `MAX_BASE64_LENGTH`를 크게 올린다.
- 클라이언트에서 파일 크기 제한 안내를 추가한다.

장점:

- 수정 범위가 가장 작다.
- 기존 Gemini inlineData 구조를 유지할 수 있다.

단점:

- 근본 해결이 아니다.
- 큰 PDF, 여러 PDF, 느린 네트워크에서 계속 불안정하다.
- 브라우저가 큰 base64 문자열을 들고 있어 UX가 좋지 않다.

판단:

- 임시 시연용으로만 가능하다.
- 실제 "PDF 업로드 후 분석" 기능의 기본 구조로는 부적합하다.

### 대안 B: 서버에서 PDF 텍스트 추출 후 Gemini 분석

내용:

- 클라이언트는 `FormData`로 파일을 보낸다.
- 서버가 PDF 텍스트를 추출한다.
- Gemini에는 추출 텍스트와 파일 메타데이터를 보낸다.

장점:

- 현재 문제의 핵심인 base64 JSON 전송을 제거한다.
- 텍스트 기반 강의자료 분석에 안정적이다.
- 여러 파일 통합 분석을 구현하기 쉽다.
- 기존 JSON 스키마와 후처리 로직을 유지할 수 있다.

단점:

- 스캔 PDF처럼 텍스트 레이어가 없는 자료는 별도 OCR이 필요하다.
- PDF 파서 라이브러리 추가가 필요하다.
- 표/도식/이미지 맥락은 Gemini 직접 PDF 처리보다 약할 수 있다.

판단:

- 1차 개선의 추천안이다.
- 법학 강의자료 PDF가 대부분 텍스트 기반이면 가장 현실적이다.

### 대안 C: Gemini 파일 업로드 또는 파일 입력 기반 분석

내용:

- 서버가 PDF 파일을 Gemini 파일 처리 방식으로 전달한다.
- Gemini가 문서 전체를 직접 분석한다.

장점:

- PDF 문서 자체를 모델이 처리한다.
- 표, 이미지, 도식이 많은 자료에서 유리할 수 있다.
- 텍스트 추출 품질 문제를 일부 피할 수 있다.

단점:

- 구현과 운영 흐름이 대안 B보다 복잡하다.
- 파일 업로드 상태, 대기, 실패, 재시도 처리가 필요하다.
- 무료 티어 제한과 파일 크기 제한을 별도로 확인해야 한다.

판단:

- 2차 개선 또는 스캔/도식 자료 지원 단계에서 검토한다.
- MVP에서는 대안 B로 먼저 안정화한다.

## 최종 추천안

MVP 개선은 대안 B로 진행한다.

```text
FormData 업로드
-> 서버 PDF 텍스트 추출
-> 텍스트 정리/길이 제한/여러 파일 병합
-> Gemini JSON 분석
-> 기존 지도 저장 흐름 유지
```

스캔 PDF나 이미지 중심 PDF는 다음 단계에서 Gemini 파일 입력 또는 OCR을 추가한다.

## API 설계

### 기존 API

`POST /api/ai/analyze-material`

현재 요청:

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

### 개선 API

같은 라우트를 유지하되 `multipart/form-data`를 받도록 바꾼다.

요청 필드:

```text
subjectId: string
subjectName: string
weekNumber: string
files: File[]
```

서버 내부 타입:

```ts
type UploadedMaterial = {
  fileName: string;
  mimeType: string;
  size: number;
  extractedText: string;
  pageCount?: number;
};
```

응답은 기존과 동일하게 유지한다.

```ts
type AnalyzeMaterialResponse = {
  ok: true;
  data: AnalyzeMaterialAIResult;
  warnings?: string[];
} | {
  ok: false;
  errorCode: AiApiErrorCode;
  message: string;
};
```

`warnings` 예시:

- "2개 파일 중 1개 파일에서 텍스트를 추출하지 못했습니다."
- "자료가 길어 앞부분과 주요 페이지 중심으로 분석했습니다."
- "스캔 PDF로 보입니다. 텍스트 추출이 제한되어 파일명 기반 임시 구조를 생성했습니다."

## 서버 처리 단계

### 1. 요청 파싱

`request.formData()`를 사용한다.

검증:

- `subjectName` 필수
- `weekNumber`는 1~16 정수
- `files`는 1개 이상
- 허용 MIME 타입은 1차에서 `application/pdf`, `text/plain`으로 제한
- 개별 파일 크기 제한은 예: 25MB
- 전체 파일 크기 제한은 예: 50MB

### 2. PDF 텍스트 추출

서버에서 PDF 파서 라이브러리를 사용한다.

후보:

- `pdf-parse`
- `pdfjs-dist`

선택 기준:

- Next.js Route Handler에서 안정적으로 동작하는지
- Node 런타임에서 파일 buffer 입력을 지원하는지
- 페이지 수와 텍스트를 얻을 수 있는지

1차 구현에서는 `pdf-parse` 계열을 먼저 검토한다. 빌드 문제가 있으면 `pdfjs-dist`로 전환한다.

### 3. 텍스트 정리

추출 텍스트는 Gemini에 보내기 전에 정리한다.

규칙:

- 연속 공백 정리
- 빈 줄 축소
- 페이지 구분 표기 유지 가능
- 파일명과 페이지 정보를 앞에 붙인다.
- 너무 긴 텍스트는 최대 길이를 둔다.

예시:

```text
[파일: 민법총칙 5주차.pdf]
[페이지 1]
...

[페이지 2]
...
```

### 4. 긴 자료 처리

초기 MVP에서는 전체 추출 텍스트를 일정 길이로 자른다.

권장:

- `MAX_EXTRACTED_TEXT_LENGTH = 80_000` 또는 `100_000`
- 잘림이 발생하면 `warnings`에 표시

후속 개선:

1. 파일별 요약 chunk 생성
2. chunk별 핵심 개념 후보 추출
3. 최종 통합 프롬프트로 중복 제거 및 개념지도 생성

### 5. Gemini 분석 호출

기존 `buildAnalyzeMaterialPrompt`와 `requestGeminiJson`을 재사용한다.

입력 `materialLabel`에는 base64 대신 정리된 텍스트를 넣는다.

```ts
const prompt = buildAnalyzeMaterialPrompt({
  subjectName,
  weekNumber,
  fileName: files.map((file) => file.name).join(", "),
  materialLabel: mergedExtractedText,
});
```

응답 검증은 기존 `AnalyzeMaterialSchema`를 유지한다.

### 6. 실패 처리

실패 유형별 메시지를 분리한다.

- 파일 크기 초과: 업로드 전에 클라이언트에서도 막고, 서버에서도 413 반환
- 텍스트 추출 실패: 스캔 PDF 가능성을 안내
- Gemini rate limit: 잠시 후 재시도 안내
- Gemini JSON 오류: fallback 구조 저장 또는 재시도 안내

## 클라이언트 변경 설계

대상 파일:

- `src/app/upload/page.tsx`

변경 방향:

1. `readFileAsBase64` 제거
2. `fetch` body를 JSON이 아니라 `FormData`로 변경
3. 여러 파일을 모두 `formData.append("files", file)`로 전송
4. 파일 크기와 확장자를 업로드 전 검증
5. 진행 상태를 세분화

상태 예시:

```ts
type Status =
  | "idle"
  | "uploading"
  | "extracting"
  | "analyzing"
  | "analyzed"
  | "error";
```

MVP에서는 서버가 세부 진행률을 실시간으로 알려주지 않으므로 UI 문구만 단계형으로 표현한다.

예시 문구:

- 업로드 중...
- PDF 텍스트를 추출하는 중...
- AI가 개념 구조를 생성하는 중...
- 분석 완료

## 여러 파일 통합 설계

현재는 첫 번째 파일만 분석한다. 개선 후에는 모든 파일의 추출 텍스트를 합친 뒤 하나의 주차 분석으로 Gemini에 보낸다.

통합 규칙:

- 파일별 제목을 명확히 표시한다.
- 중복 개념은 Gemini 프롬프트에서 하나로 합치게 한다.
- `sourceExcerpt`에는 가능하면 파일명 또는 페이지 단서를 포함하게 한다.

프롬프트 보완 규칙:

```text
- 여러 파일이 입력된 경우, 같은 개념은 하나로 통합한다.
- sourceExcerpt에는 가능한 한 어떤 파일에서 나온 내용인지 알 수 있는 짧은 단서를 포함한다.
- 파일별 목차가 충돌하면 주차 전체 개념 구조에 맞게 재배열한다.
```

## PPT 처리 범위

1차 개선에서는 PPT 실제 분석을 지원 범위에서 제외한다.

이유:

- PPTX 텍스트 추출은 PDF와 다른 파서가 필요하다.
- 현재 UI 문구와 실제 기능이 다르므로 먼저 PDF를 안정화한다.

1차 UI 정책:

- 파일 선택 accept를 `.pdf,.txt`로 제한한다.
- 안내 문구에서 PPT를 제거한다.

2차 개선 후보:

- `pptx` 텍스트 추출 라이브러리 검토
- PPT를 PDF로 변환 후 같은 파이프라인 사용
- Gemini 파일 입력 기반으로 PPT 지원 가능 여부 검토

## 데이터 저장 영향

현재 저장 흐름은 유지한다.

```text
AnalyzeMaterialAIResult
-> analyzeAiResultToDemoData
-> saveMaterialAnalysis
-> weeks / aiWeekConceptsByWeekId / aiMaterialsByWeekId / mapSnapshots 저장
```

다만 여러 파일을 저장하려면 `saveMaterialAnalysis` 입력 구조를 확장해야 한다.

현재:

```ts
saveMaterialAnalysis({
  subjectId,
  fileName,
  mimeType,
  analysis,
})
```

개선:

```ts
saveMaterialAnalysis({
  subjectId,
  materials: [
    { fileName, mimeType, size },
  ],
  analysis,
})
```

MVP에서는 분석 대표 파일명을 첫 번째 파일명 또는 `"N개 자료 통합"`으로 저장해도 된다. 다만 실제 여러 파일 목록을 주차 상세에서 보여주려면 `materials` 배열 지원이 필요하다.

## 구현 단계

### 1단계: 업로드 API를 FormData로 전환

대상:

- `src/app/upload/page.tsx`
- `src/app/api/ai/analyze-material/route.ts`

작업:

- 클라이언트 base64 변환 제거
- 서버 `request.formData()` 처리 추가
- PDF 파일 buffer 읽기
- 파일 크기/타입 검증

완료 기준:

- 10MB 이상 PDF를 선택해도 클라이언트가 base64 변환으로 멈추지 않는다.
- 서버가 파일 크기 초과/타입 오류를 명확히 반환한다.

### 2단계: PDF 텍스트 추출 추가

대상:

- `src/lib/ai/pdf-extract.ts` 신규
- `src/app/api/ai/analyze-material/route.ts`

작업:

- PDF buffer에서 텍스트 추출
- 텍스트 없는 PDF 감지
- 파일별 추출 결과와 warning 생성

완료 기준:

- 기존 `materials/민법총칙 4주차...pdf`에서 텍스트를 추출한다.
- 기존 `materials/민법총칙 5주차...pdf`도 크기 제한에 걸리지 않고 텍스트 추출 단계까지 간다.

### 3단계: Gemini 텍스트 분석 연결

대상:

- `src/lib/ai/prompts.ts`
- `src/app/api/ai/analyze-material/route.ts`

작업:

- 추출 텍스트를 `buildAnalyzeMaterialPrompt`에 전달
- 여러 파일 통합 규칙을 프롬프트에 보완
- 너무 긴 텍스트 자르기와 warning 처리

완료 기준:

- PDF 업로드 후 `AnalyzeMaterialAIResult`가 반환된다.
- 반환 결과가 `AnalyzeMaterialSchema` 검증을 통과한다.

### 4단계: 저장 구조 보완

대상:

- `src/lib/demo-store.ts`
- `src/lib/ai/transforms.ts`
- `src/lib/types.ts`

작업:

- 여러 파일명을 주차 자료 목록에 저장할 수 있게 확장
- 최소 MVP에서는 대표 material 하나로 저장하고, 후속 작업에서 복수 material 저장으로 확장 가능

완료 기준:

- 분석 완료 후 과목/주차 상세로 이동한다.
- 새 주차 또는 기존 주차에 분석 결과가 지도에 표시된다.

### 5단계: UI 오류/상태 개선

대상:

- `src/app/upload/page.tsx`

작업:

- 허용 파일 안내를 실제 기능과 맞춘다.
- 파일 크기 초과를 업로드 전 표시한다.
- 분석 실패 메시지를 화면에 명확히 표시한다.
- 여러 파일이 실제로 통합 분석된다는 점을 UI와 동작에서 일치시킨다.

완료 기준:

- 실패 시 "멈춤"이 아니라 원인 메시지가 보인다.
- 분석 완료 시 "과목 상세에서 지식 지도 보기" 버튼이 정상 동작한다.

## 테스트 계획

### 수동 테스트

1. 작은 `.txt` 파일 업로드
2. 5MB PDF 업로드
3. 10MB 이상 PDF 업로드
4. PDF 2개 동시 업로드
5. 잘못된 파일 타입 업로드
6. 텍스트가 거의 없는 스캔 PDF 업로드
7. Gemini rate limit 또는 API 오류 시 fallback 메시지 확인

### 검증 포인트

- 서버가 413, 400, AI 실패를 구분해 응답한다.
- Gemini 연결 실패 시에도 앱이 무한 로딩에 빠지지 않는다.
- 분석 성공 시 `weeks`, `aiWeekConceptsByWeekId`, `mapSnapshots`가 갱신된다.
- 개념지도 화면에서 새 분석 결과가 보인다.

## 리스크와 대응

### PDF 텍스트 추출 품질

리스크:

- 강의자료가 이미지 기반 PDF면 텍스트가 추출되지 않는다.

대응:

- 텍스트 추출 결과가 너무 짧으면 "스캔 PDF 가능성" warning을 표시한다.
- 2차 개선에서 OCR 또는 Gemini 파일 입력 기반 처리를 추가한다.

### 긴 자료의 개념 누락

리스크:

- 텍스트를 단순히 자르면 뒤쪽 개념이 빠질 수 있다.

대응:

- MVP에서는 warning을 표시한다.
- 후속 개선에서 chunk별 개념 후보 추출 후 최종 병합 방식으로 개선한다.

### 무료 티어 rate limit

리스크:

- PDF 분석은 입력량이 커서 rate limit에 빨리 걸릴 수 있다.

대응:

- 같은 파일 분석 결과를 저장해 재호출을 줄인다.
- 실패 시 명확한 재시도 메시지를 표시한다.

## 결정 사항

- 1차 개선은 PDF 텍스트 추출 기반으로 진행한다.
- Gemini 연결부와 JSON 스키마는 유지한다.
- base64 JSON 전송은 제거한다.
- PPT 실제 분석은 1차 범위에서 제외하고 UI 문구를 실제 지원 범위에 맞춘다.
- 여러 파일 업로드는 실제로 모든 파일을 분석에 포함하도록 바꾼다.

## 보류 사항

- Gemini 파일 업로드 방식 적용 여부
- OCR 도입 여부
- PPTX 직접 분석 지원 여부
- 분석 결과를 Zustand가 아니라 실제 DB에 저장하는 시점
- chunk 기반 대형 문서 분석 파이프라인 도입 시점
