import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as File | null;

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const audioBuffer = await audio.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const mimeType = audio.type || "audio/webm";

    const genAI = new GoogleGenerativeAI(apiKey);
    // Gemini 2.0 Flash supports native audio ingestion and is extremely fast
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      "You are an expert Malayalam transcriptionist. Transcribe the spoken Malayalam in the attached audio file exactly as said. Return ONLY the transcribed text in Malayalam script, without any quotes, notes, or translations.",
      {
        inlineData: {
          mimeType: mimeType,
          data: audioBase64,
        },
      },
    ]);

    const transcript = result.response.text().trim();

    return NextResponse.json({ transcript, confidence: 0.95 });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Transcription failed" },
      { status: 500 }
    );
  }
}
