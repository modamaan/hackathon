import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";
import {
  Camera,
  Mic,
  CloudSun,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0B2518 0%, #1A4731 45%, #0F3D2B 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #4ade80, transparent)" }}
          />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #86efac, transparent)" }}
          />

          <div className="relative max-w-3xl mx-auto text-center space-y-8 z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-green-400/30 bg-green-400/10 rounded-full px-4 py-1.5 text-sm text-green-300 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 2.0 · Google Maps Weather · Firebase
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white leading-none">
                Farm<span className="text-green-400">Bot</span>
              </h1>
              <p className="mt-4 text-3xl sm:text-4xl font-bold text-green-300 font-malayalam">
                നിങ്ങളുടെ കൃഷിക്ക് AI സഹായം
              </p>
            </div>

            <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              Upload a photo of your diseased leaf. Get an instant AI diagnosis
              and a <span className="text-green-300 font-semibold">weather-aware treatment plan in Malayalam</span> — powered by Gemini AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/diagnose"
                className="inline-flex items-center justify-center gap-2 rounded-xl font-bold text-base px-8 py-3.5 bg-green-400 text-green-950 hover:bg-green-300 transition-all shadow-lg shadow-green-900/50"
              >
                Start Free Diagnosis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-base px-8 py-3.5 border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                View History
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {[
                { icon: CheckCircle, text: "Free to use" },
                { icon: Mic, text: "Malayalam voice" },
                { icon: CloudSun, text: "Live weather data" },
                { icon: Camera, text: "Any leaf photo" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-sm text-green-200/80 bg-white/5 border border-white/10 rounded-full px-3 py-1"
                >
                  <Icon className="w-3.5 h-3.5 text-green-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Mock result card floating at bottom */}
          <div className="relative z-10 mt-16 w-full max-w-sm mx-auto pb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 text-left shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-400/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Detected</p>
                  <p className="font-bold text-white text-sm">Late Blight · Tomato</p>
                </div>
                <span className="ml-auto text-xs bg-orange-400/20 text-orange-300 border border-orange-400/30 rounded-full px-2 py-0.5">
                  Moderate
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full mb-1">
                <div className="h-1.5 w-4/5 bg-green-400 rounded-full" />
              </div>
              <p className="text-xs text-white/40 mb-3">87% confidence</p>
              <p className="text-xs text-green-200/70 font-malayalam leading-relaxed line-clamp-2">
                🌿 ലേറ്റ് ബ്ലൈറ്റ് ടൊമാറ്റോ ചെടിയിൽ കാണുന്ന ഒരു ഗുരുതരമായ രോഗമാണ്...
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section className="py-24 px-4 bg-white dark:bg-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-3 text-primary">
                Simple 3-step process
              </Badge>
              <h2 className="text-4xl font-black tracking-tight">
                How FarmBot Works
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto">
                From a blurry leaf photo to a full Malayalam treatment plan in under 30 seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Camera,
                  step: "1",
                  title: "Snap the Leaf",
                  titleMl: "ഇല ചിത്രം",
                  desc: "Take a clear photo of the diseased leaf with your phone or upload from gallery. Camera supported.",
                  color: "#16a34a",
                  bg: "#f0fdf4",
                },
                {
                  icon: MapPin,
                  step: "2",
                  title: "Share Location",
                  titleMl: "സ്ഥലം ഷെയർ",
                  desc: "One-tap GPS share. We fetch real-time temperature, humidity and 5-day forecast for your village.",
                  color: "#2563eb",
                  bg: "#eff6ff",
                },
                {
                  icon: Sparkles,
                  step: "3",
                  title: "Get Treatment",
                  titleMl: "ചികിൽസ പ്ലാൻ",
                  desc: "Receive a complete day-by-day treatment plan in Malayalam tailored to your local weather conditions.",
                  color: "#7c3aed",
                  bg: "#f5f3ff",
                },
              ].map(({ icon: Icon, step, title, titleMl, desc, color, bg }) => (
                <div key={step} className="relative group">
                  <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <CardContent className="pt-6 pb-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: bg }}
                        >
                          <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <span
                          className="text-5xl font-black opacity-10"
                          style={{ color }}
                        >
                          {step}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{title}</h3>
                        <p className="text-sm font-malayalam font-semibold" style={{ color }}>
                          {titleMl}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50 dark:bg-muted/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black">Why farmers love FarmBot</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Zap,
                  title: "Instant Diagnosis",
                  desc: "Gemini 2.0 Flash analyzes your leaf in seconds — identifying disease, crop type, and severity.",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  icon: CloudSun,
                  title: "Weather-Aware Plans",
                  desc: "Treatment steps change based on rainfall, humidity, and your 5-day forecast from Google Maps Weather.",
                  color: "text-sky-600",
                  bg: "bg-sky-50",
                },
                {
                  icon: Mic,
                  title: "Malayalam Voice",
                  desc: "Record a voice note in Malayalam. Google STT transcribes it and Gemini responds with advice.",
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
                {
                  icon: MapPin,
                  title: "GPS Location",
                  desc: "One-tap location sharing. We geocode it to your village name for a personal touch.",
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                },
                {
                  icon: ShieldCheck,
                  title: "Both Organic & Chemical",
                  desc: "Treatment plan always offers organic AND chemical options with exact dosage instructions.",
                  color: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  icon: Leaf,
                  title: "History Saved",
                  desc: "All diagnoses saved to Firebase under your phone number. Review past treatments anytime.",
                  color: "text-teal-600",
                  bg: "bg-teal-50",
                },
              ].map(({ icon: Icon, title, desc, color, bg }) => (
                <Card
                  key={title}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div
                      className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <h3 className="font-bold text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────── */}
        <section
          className="py-24 px-4 text-center text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0B2518 0%, #1A4731 60%, #0F3D2B 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 50%, #86efac 0%, transparent 50%)",
            }}
          />
          <div className="relative max-w-xl mx-auto space-y-6">
            <h2 className="text-4xl font-black">
              Ready to save your crop?
            </h2>
            <p className="font-malayalam text-green-300 text-xl font-semibold">
              ഇപ്പോൾ തന്നെ ആരംഭിക്കൂ — സൗജന്യമായി
            </p>
            <p className="text-white/60 text-sm">
              No registration needed. Just upload a leaf photo.
            </p>
            <Link
              href="/diagnose"
              className="inline-flex items-center gap-2 rounded-xl font-bold text-base px-10 py-4 bg-green-400 text-green-950 hover:bg-green-300 transition-all shadow-xl shadow-green-900/40"
            >
              <Leaf className="w-4 h-4" />
              Start Free Diagnosis
            </Link>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer
          className="border-t py-10 px-4 text-center"
          style={{ background: "#071A0F" }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-green-400 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-950" />
            </div>
            <span className="font-bold text-white text-lg">FarmBot</span>
          </div>
          <p className="text-sm text-white/40">
            Built with Gemini AI · Google Maps Weather API · Firebase ·{" "}
            <span className="font-malayalam">കേരള കർഷകർക്കായി ❤️</span>
          </p>
        </footer>
      </main>
    </>
  );
}
