// pdf-parse v2 ESM build has no default export; import= targets the CJS build
// and aligns with the @types/pdf-parse `export =` declaration
import pdfParse = require("pdf-parse");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text could be extracted from this PDF. It may be a scanned image.");
    }
    return data.text.trim();
  } catch (error) {
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
