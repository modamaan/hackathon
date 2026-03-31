"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { AnalysisResult } from "@/lib/types";
import {
  Thermometer,
  Droplets,
  CloudRain,
  MapPin,
  AlertTriangle,
  Leaf,
  Calendar,
} from "lucide-react";

interface Props {
  result: AnalysisResult;
}

const severityConfig = {
  mild: { label: "Mild", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  moderate: { label: "Moderate", className: "bg-orange-100 text-orange-800 border-orange-200" },
  severe: { label: "Severe", className: "bg-red-100 text-red-800 border-red-200" },
  unknown: { label: "Unknown", className: "bg-gray-100 text-gray-800 border-gray-200" },
};

function formatTreatmentPlan(text: string) {
  // Convert bold headers **text** to styled spans and bullet points
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const boldMatch = line.match(/^\*\*(.*?)\*\*/);
    if (boldMatch) {
      return (
        <h4 key={i} className="font-bold text-foreground mt-5 mb-2 text-sm">
          {boldMatch[1]}
        </h4>
      );
    }
    if (line.startsWith("•") || line.startsWith("-")) {
      return (
        <p key={i} className="text-sm text-muted-foreground pl-3 mb-1 font-malayalam leading-relaxed">
          {line}
        </p>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return (
      <p key={i} className="text-sm text-muted-foreground mb-1 font-malayalam leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function ResultsPanel({ result }: Props) {
  const { diagnosis, weather, location, treatmentPlan } = result;
  const severity = severityConfig[diagnosis.severity] || severityConfig.unknown;

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Disease Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {diagnosis.crop}
                </span>
              </div>
              <CardTitle className="text-xl leading-tight">
                {diagnosis.disease}
              </CardTitle>
              <p className="text-base font-malayalam text-muted-foreground mt-1">
                {diagnosis.malayalam_disease}
              </p>
            </div>
            <Badge className={`${severity.className} border text-xs flex-shrink-0`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {severity.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Confidence */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-semibold">{diagnosis.confidence}%</span>
            </div>
            <Progress value={diagnosis.confidence} className="h-2" />
          </div>

          {/* Symptoms */}
          {diagnosis.symptoms.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Observed Symptoms
              </p>
              <div className="flex flex-wrap gap-1.5">
                {diagnosis.symptoms.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {location?.formatted && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{location.formatted}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weather Card */}
      {weather && (
        <Card className="border-blue-100 dark:border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-500" />
              Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-muted/40 rounded-lg">
                <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.temperature}°</p>
                <p className="text-xs text-muted-foreground">Temp (°C)</p>
              </div>
              <div className="text-center p-2 bg-muted/40 rounded-lg">
                <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
              <div className="text-center p-2 bg-muted/40 rounded-lg">
                <CloudRain className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{weather.rainMmPerDay}</p>
                <p className="text-xs text-muted-foreground">mm Rain</p>
              </div>
            </div>

            {/* 5-day forecast */}
            {weather.forecast.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 5-Day Forecast
                  </p>
                  <div className="space-y-1">
                    {weather.forecast.slice(0, 5).map((day, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <span className="text-muted-foreground w-12">{day.date}</span>
                        <span className="flex-1 text-center text-muted-foreground truncate px-2">
                          {day.description}
                        </span>
                        <span className="text-blue-500 w-14 text-right">
                          {day.rainMm}mm
                        </span>
                        <span className="w-20 text-right font-medium">
                          {day.low}–{day.high}°C
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Treatment Plan Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>💊</span>
            <span className="font-malayalam">ചികിൽസ പ്ലാൻ</span>
            <span className="text-muted-foreground font-normal">— Treatment Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {formatTreatmentPlan(treatmentPlan)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
