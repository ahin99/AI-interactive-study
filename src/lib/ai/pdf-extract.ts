import pdfParse from "pdf-parse/lib/pdf-parse.js";

export type PdfExtractionResult = {
  text: string;
  pageCount?: number;
};

function normalizeExtractedText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractPdfText(data: Uint8Array): Promise<PdfExtractionResult> {
  const result = await pdfParse(Buffer.from(data));
  return {
    text: normalizeExtractedText(result.text ?? ""),
    pageCount: result.numpages,
  };
}
