import { createClient } from "@/lib/supabase/server";
import { analyzeRequestSchema, analysisResultSchema } from "@/lib/schemas";
import { buildAnalysisPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import { openai } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { generateObject } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Validation failed:", JSON.stringify(parsed.error.flatten(), null, 2));
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cvText: rawCvText, cvFilePath, questionnaire } = parsed.data;
    let cvText = rawCvText;

    // If a file path was provided and text is minimal, extract from PDF
    if (cvFilePath && cvText.length < 100) {
      const { data: fileData, error: fileError } = await supabase.storage
        .from("cv-uploads")
        .download(cvFilePath);

      if (fileError || !fileData) {
        return NextResponse.json(
          { error: "Failed to download CV file" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const extractedText = await extractTextFromPdf(buffer);

      if (extractedText.length < 50) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from PDF. Please paste your CV text instead.",
          },
          { status: 400 }
        );
      }

      cvText = extractedText;
    }

    // Truncate very long CVs
    if (cvText.length > 12000) {
      cvText = cvText.slice(0, 12000) + "\n\n[CV text truncated for analysis]";
    }

    // Create analysis row
    const { data: analysis, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        cv_text: cvText,
        cv_file_path: cvFilePath || null,
        questionnaire,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !analysis) {
      return NextResponse.json(
        { error: "Failed to create analysis" },
        { status: 500 }
      );
    }

    // Call OpenAI
    try {
      const prompt = buildAnalysisPrompt(cvText, questionnaire);

      const { object: result } = await generateObject({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
        schema: analysisResultSchema,
        system: SYSTEM_PROMPT,
        prompt,
      });

      // Save result
      await supabase
        .from("analyses")
        .update({ result, status: "completed" })
        .eq("id", analysis.id);

      return NextResponse.json({ analysisId: analysis.id });
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);

      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message:
            aiError instanceof Error ? aiError.message : "AI analysis failed",
        })
        .eq("id", analysis.id);

      return NextResponse.json({ analysisId: analysis.id });
    }
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
