export interface DiagnosisResult {
  crop: string;
  disease: string;
  malayalam_disease: string;
  confidence: number;
  symptoms: string[];
  severity: "mild" | "moderate" | "severe" | "unknown";
  possible_causes: string[];
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  description: string;
  rainMm: number;
  humidity: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  rainMmPerDay: number;
  forecast: ForecastDay[];
}

export interface LocationData {
  lat: number;
  lon: number;
  village?: string;
  district?: string;
  state?: string;
  formatted?: string;
}

export interface AnalysisResult {
  diagnosis: DiagnosisResult;
  weather: WeatherData | null;
  location: LocationData | null;
  treatmentPlan: string;
  timestamp: string;
}

export interface DiagnosisRecord extends AnalysisResult {
  id?: string;
  uid: string;
  imageUrl?: string;
  transcript?: string;
}
