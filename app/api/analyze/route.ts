import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminDb } from "@/lib/firebase-admin";
import type { DiagnosisResult, WeatherData, LocationData, DiagnosisRecord } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// gemini-2.0-flash is stable, fast, and supports vision + audio
const MODEL_NAME = "gemini-2.5-flash";

// Route timeout: 60 seconds
export const maxDuration = 60;

async function analyzeLeafImage(
  imageBase64: string,
  mimeType: string
): Promise<DiagnosisResult> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `You are an expert agricultural plant pathologist. Analyze this plant leaf image carefully.
Return ONLY valid JSON with no markdown, no code blocks, no explanation:
{
  "crop": "<crop name in English e.g. tomato, rice, coconut, banana>",
  "disease": "<disease name in English>",
  "malayalam_disease": "<disease name in Malayalam script>",
  "confidence": <integer 0-100>,
  "symptoms": ["<visible symptom 1>", "<visible symptom 2>"],
  "severity": "<one of: mild, moderate, severe>",
  "possible_causes": ["<cause 1>", "<cause 2>"]
}
If you cannot identify a disease, return:
{"crop":"unknown","disease":"unknown","malayalam_disease":"തിരിച്ചറിഞ്ഞില്ല","confidence":0,"symptoms":[],"severity":"mild","possible_causes":[]}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse Gemini vision response");
  return JSON.parse(jsonMatch[0]);
}

async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Open-Meteo: free, no API key, reliable
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,relative_humidity_2m_max` +
      `&forecast_days=5&timezone=Asia%2FKolkata`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();

    const wmoDesc = (code: number): string => {
      if (code === 0) return "Clear sky";
      if (code <= 3) return "Partly cloudy";
      if (code <= 49) return "Foggy";
      if (code <= 67) return "Rainy";
      if (code <= 77) return "Snowy";
      if (code <= 82) return "Showers";
      return "Thunderstorm";
    };

    const c = data.current;
    const d = data.daily;

    const forecastDays = (d.time as string[]).map((date: string, i: number) => ({
      date,
      high: Math.round(d.temperature_2m_max[i]),
      low: Math.round(d.temperature_2m_min[i]),
      description: wmoDesc(d.weathercode[i]),
      rainMm: Math.round(d.precipitation_sum[i] || 0),
      humidity: d.relative_humidity_2m_max[i] || 0,
    }));

    return {
      temperature: Math.round(c.temperature_2m),
      humidity: c.relative_humidity_2m,
      description: wmoDesc(c.weather_code),
      rainMmPerDay: Math.round(c.precipitation || 0),
      forecast: forecastDays,
    };
  } catch (e) {
    console.error("Weather API error:", e);
    return null;
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return { lat, lon };

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.status !== "OK" || !data.results.length) return { lat, lon };

    const comps = data.results[0].address_components;
    const get = (type: string) =>
      comps.find((c: any) => c.types.includes(type))?.long_name || "";

    return {
      lat,
      lon,
      village:
        get("sublocality_level_1") ||
        get("locality") ||
        get("administrative_area_level_3"),
      district: get("administrative_area_level_2"),
      state: get("administrative_area_level_1"),
      formatted: data.results[0].formatted_address,
    };
  } catch (e) {
    console.error("Geocoding error:", e);
    return { lat, lon };
  }
}

async function generateTreatmentPlan(
  diagnosis: DiagnosisResult,
  weather: WeatherData | null,
  location: LocationData | null
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const weatherSummary = weather
    ? `ഇപ്പോൾ: ${weather.temperature}°C, ഈർപ്പം ${weather.humidity}%, ${weather.description}. 5 ദിവസത്തെ പ്രവചനം: ${weather.forecast
        .map((d) => `${d.date}: ${d.description}, ${d.rainMm}mm മഴ, ${d.humidity}% ഈർപ്പം`)
        .join("; ")}`
    : "കാലാവസ്ഥ ഡേറ്റ ലഭ്യമല്ല";

  const locationName =
    location?.village || location?.district || location?.formatted || "നിങ്ങളുടെ സ്ഥലം";

  const prompt = `You are a warm, friendly agricultural advisor for farmers in Kerala, India.
Speak in simple, everyday Malayalam — like a trusted neighbor helping a farmer.
Address the farmer as "ചേട്ടാ".

Detected disease: ${diagnosis.disease} (${diagnosis.malayalam_disease})
Crop: ${diagnosis.crop}
Severity: ${diagnosis.severity}
Symptoms observed: ${diagnosis.symptoms.join(", ")}
Location: ${locationName}
Weather context: ${weatherSummary}

Write a complete treatment plan in Malayalam using exactly these bold section headers:

**🌿 രോഗം എന്താണ്**
**🌧️ ഇത് ഇപ്പോൾ കൂടുതലായ കാരണം**
**💊 ഉടനടി ചെയ്യേണ്ടത്**
**🗓️ 5 ദിവസത്തെ പ്ലാൻ**
**🚫 ചെയ്യരുതാത്തത്**
**📞 കൂടുതൽ സഹായത്തിന്**

Rules:
- Connect weather data to disease risk in section 2
- Give both organic AND chemical options in section 3 with dosage
- Section 4 must be day-by-day based on the weather forecast
- Section 6: mention "കൃഷി ഭവൻ" and local contact
- Keep it warm, reassuring and under 400 words
- Use bullet points (•) inside sections`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Hard timeout: abort if analysis takes >55s
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 55_000);

    const formData = await request.formData();
    const uid = formData.get("uid") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const image = formData.get("image") as File | null;
    const latStr = formData.get("lat") as string;
    const lonStr = formData.get("lon") as string;

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const lat = latStr ? parseFloat(latStr) : null;
    const lon = lonStr ? parseFloat(lonStr) : null;
    const hasLocation = !!(lat !== null && lon !== null);

    let diagnosis: DiagnosisResult;
    let weather: WeatherData | null = null;
    let location: LocationData | null = null;

    try {
      [diagnosis, weather, location] = await Promise.all([
        analyzeLeafImage(imageBase64, mimeType),
        hasLocation ? getWeather(lat!, lon!) : Promise.resolve(null),
        hasLocation ? reverseGeocode(lat!, lon!) : Promise.resolve(null),
      ]) as [DiagnosisResult, WeatherData | null, LocationData | null];
    } finally {
      clearTimeout(timeout);
    }

    const treatmentPlan = await generateTreatmentPlan(diagnosis!, weather, location);

    const result: DiagnosisRecord = {
      uid: uid || "anonymous",
      imageUrl: imageUrl || "",
      diagnosis,
      weather,
      location,
      treatmentPlan,
      timestamp: new Date().toISOString(),
    };

    if (uid) {
      try {
        const db = getAdminDb();
        const userRef = db.collection("farmers").doc(uid);
        const diagnosesRef = userRef.collection("diagnoses");
        await diagnosesRef.add(result);
        console.log(`Saved history for UID ${uid}`);
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
