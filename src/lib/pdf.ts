import pdfParse from "pdf-parse";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text could be extracted. The PDF may be a scanned image — try pasting your CV text instead.");
    }
    return data.text.trim();
  } catch (error) {
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
