"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, CheckCircle, XCircle } from "lucide-react";

interface LocationInfo {
  lat: number;
  lon: number;
  name: string;
}

interface Props {
  onLocation: (info: LocationInfo) => void;
}

export default function LocationPicker({ onLocation }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "denied">(
    "idle"
  );
  const [locationName, setLocationName] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setState("denied");
      return;
    }

    setState("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Try to get a human-readable name via our analyze API's geocoding
        // For now, show coordinates — the API will resolve the name
        const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setLocationName(name);
        setState("done");
        onLocation({ lat, lon, name });
      },
      () => {
        setState("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      {state === "idle" && (
        <button
          onClick={getLocation}
          className="w-full border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-5 text-center transition-all hover:bg-primary/3 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm font-malayalam">
                ലൊക്കേഷൻ ഷെയർ ചെയ്യൂ
              </p>
              <p className="text-xs text-muted-foreground">
                Share location for weather-based treatment plan
              </p>
            </div>
          </div>
        </button>
      )}

      {state === "loading" && (
        <div className="border rounded-xl p-5 flex items-center gap-3 bg-muted/30">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <p className="text-sm font-malayalam text-muted-foreground">
            ലൊക്കേഷൻ നോക്കുന്നു...
          </p>
        </div>
      )}

      {state === "done" && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-primary font-medium">
                Location detected
              </p>
              <p className="text-sm font-semibold">{locationName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setState("idle")}
          >
            Change
          </Button>
        </div>
      )}

      {state === "denied" && (
        <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-xs text-destructive font-medium">
                Location access denied
              </p>
              <p className="text-xs text-muted-foreground">
                Analysis will proceed without weather data
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={getLocation}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
