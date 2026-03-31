"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Play, Square, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [state, setState] = useState<
    "idle" | "recording" | "processing" | "done" | "error"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDuration = 60; // seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    chunksRef.current = [];
    setDuration(0);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        await transcribeAudio(blob);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setState("recording");

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d + 1 >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return d + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setState("processing");
  };

  const transcribeAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error("Transcription failed. Please type your query manually.");
        setState("error");
        return;
      }

      if (data.transcript) {
        setTranscript(data.transcript);
        onTranscript(data.transcript);
        setState("done");

        if (data.confidence < 0.7) {
          toast.warning("Low confidence transcription. Please verify the text.");
        }
      } else {
        toast.error("Could not understand audio. Please try again.");
        setState("error");
      }
    } catch {
      toast.error("Transcription service error");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setAudioUrl(null);
    setDuration(0);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mic className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold mb-1 font-malayalam">
            Malayalam-ൽ സംസാരിക്കൂ
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Describe your crop problem in Malayalam (up to 60 seconds)
          </p>
          <Button onClick={startRecording}>
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        </div>
      )}

      {state === "recording" && (
        <div className="border-2 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 rounded-xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold text-red-600 dark:text-red-400">
              Recording... {formatTime(duration)}
            </span>
          </div>
          <Progress value={(duration / maxDuration) * 100} className="h-2" />
          <Button variant="destructive" onClick={stopRecording}>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        </div>
      )}

      {state === "processing" && (
        <div className="border rounded-xl p-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground font-malayalam">
            ശബ്ദം വിശകലനം ചെയ്യുന്നു...
          </p>
        </div>
      )}

      {state === "done" && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Transcription complete</span>
          </div>
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full h-8" />
          )}
          <div className="bg-background rounded-lg p-3 border">
            <p className="text-sm font-malayalam leading-relaxed">{transcript}</p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <MicOff className="w-3 h-3 mr-2" />
            Record Again
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-4 text-center space-y-3">
          <p className="text-sm text-destructive font-malayalam">
            ഒരു പ്രശ്നം ഉണ്ടായി. വീണ്ടും ശ്രമിക്കൂ.
          </p>
          <Button variant="outline" size="sm" onClick={reset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
