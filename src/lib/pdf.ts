import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse(uint8);
  await (parser as unknown as { load(): Promise<void> }).load();
  const result = await parser.getText();
  // getText returns a TextResult object with a text property
  const text = typeof result === "string" ? result : (result as { text: string }).text;
  return text.trim();
}
