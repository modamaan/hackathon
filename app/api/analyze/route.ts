import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAdminDb } from "@/lib/firebase-admin";
import type { DiagnosisResult, WeatherData, LocationData, DiagnosisRecord } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-2.5-flash";

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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&unitsSystem=METRIC`
      ),
      fetch(
        `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&days=5&unitsSystem=METRIC`
      ),
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    const cc = current.currentConditions;

    const forecastDays = (forecast.forecastDays || []).map((day: any) => ({
      date: `${day.displayDate?.month}/${day.displayDate?.day}`,
      high: Math.round(day.highTemperature?.degrees || 0),
      low: Math.round(day.lowTemperature?.degrees || 0),
      description: day.daytimeForecast?.weatherCondition?.description?.text || "",
      rainMm: Math.round(day.precipitation?.qpf?.quantity || 0),
      humidity: day.daytimeForecast?.relativeHumidity || 0,
    }));

    return {
      temperature: Math.round(cc?.temperature?.degrees || 0),
      humidity: cc?.relativeHumidity || 0,
      description: cc?.weatherCondition?.description?.text || "",
      rainMmPerDay: Math.round(cc?.precipitation?.qpf?.quantity || 0),
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

    const [diagnosis, weather, location] = await Promise.all([
      analyzeLeafImage(imageBase64, mimeType),
      hasLocation ? getWeather(lat!, lon!) : Promise.resolve(null),
      hasLocation ? reverseGeocode(lat!, lon!) : Promise.resolve(null),
    ]);

    const treatmentPlan = await generateTreatmentPlan(diagnosis, weather, location);

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
