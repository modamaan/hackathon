"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LeafUploader from "@/components/leaf-uploader";
import VoiceRecorder from "@/components/voice-recorder";
import LocationPicker from "@/components/location-picker";
import ResultsPanel from "@/components/results-panel";
import type { AnalysisResult } from "@/lib/types";
import { Loader2, Camera, Mic, Sparkles, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

export default function DiagnoseClient() {
  const [image, setImage] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  
  const { user, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("photo");

  const canAnalyze = image !== null && !loading;

  const handleAnalyze = async () => {
    if (!image) {
      toast.error("Please upload a leaf photo first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      if (location) {
        formData.append("lat", String(location.lat));
        formData.append("lon", String(location.lon));
      }
      if (user) {
        formData.append("uid", user.uid);
      }

      // 60-second timeout so the spinner never hangs forever
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60_000);

      let res: Response;
      try {
        res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Analysis failed. Please try again.");
        return;
      }

      setResult(data);

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📍
            <span>Your Location</span>
            <span className="text-xs font-normal text-muted-foreground">
              (Recommended for weather-based treatment)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationPicker
            onLocation={(info) => setLocation(info)}
          />
        </CardContent>
      </Card>

      {/* Input: Photo or Voice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Leaf Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="photo" className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex-1">
                <Mic className="w-4 h-4 mr-2" />
                Voice Note
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo">
              <LeafUploader
                onImageSelect={(file) => setImage(file)}
              />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceRecorder onTranscript={(text) => setTranscript(text)} />
              {transcript && (
                <p className="mt-3 text-xs text-muted-foreground">
                  ℹ️ Upload a leaf photo above too for the best diagnosis accuracy.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Require Authentication */}
      {!user && (
        <Card className="border-green-400/30 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-5 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Sign in to Analyze</h3>
              <p className="text-sm text-muted-foreground font-malayalam">
                നിങ്ങളുടെ പരിശോധനാ ഫലങ്ങൾ സൂക്ഷിക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക.
              </p>
            </div>
            <Button onClick={loginWithGoogle} className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              <UserIcon className="w-4 h-4" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analyze Button */}
      {user && (
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span className="font-malayalam">വിശകലനം നടക്കുന്നു...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Crop Disease
            </>
          )}
        </Button>
      )}


      {loading && (
        <div className="text-center space-y-2 py-4">
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground font-malayalam">
            Gemini AI വിശകലനം ചെയ്യുന്നു...
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <Separator />
          <div id="results" className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-lg">Analysis Results</h2>
            </div>
            <ResultsPanel result={result} />
          </div>
        </>
      )}
    </div>
  );
}
