import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import DiagnoseClient from "@/components/diagnose-client";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Diagnose Crop — FarmBot AI",
  description:
    "Upload a photo of your diseased leaf and get an AI-powered treatment plan in Malayalam.",
};

export default function DiagnosePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Crop Disease Diagnosis</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto font-malayalam">
              ഇലയുടെ ഫോട്ടോ അപ്ലോഡ് ചെയ്യൂ. AI രോഗം കണ്ടെത്തി Malayalam-ൽ ചികിൽസ പ്ലാൻ നൽകും.
            </p>
          </div>

          <DiagnoseClient />
        </div>
      </main>
    </>
  );
}
