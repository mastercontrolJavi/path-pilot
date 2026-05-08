import { createRequire } from "node:module";

// pdf-parse v2's ESM build has no default export; createRequire loads the CJS
// build at runtime, which is consistent with serverExternalPackages: ["pdf-parse"]
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (
  buf: Buffer
) => Promise<{ text: string }>;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length === 0) {
      throw new Error(
        "No text could be extracted from this PDF. It may be a scanned image."
      );
    }
    return data.text.trim();
  } catch (error) {
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
