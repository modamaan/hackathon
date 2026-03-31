"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import ResultsPanel from "@/components/results-panel";
import type { DiagnosisRecord } from "@/lib/types";
import { useAuth } from "@/components/auth-provider";
import {
  History,
  Leaf,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const severityColor: Record<string, string> = {
  mild: "bg-yellow-100 text-yellow-800 border-yellow-200",
  moderate: "bg-orange-100 text-orange-800 border-orange-200",
  severe: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-gray-100 text-gray-700 border-gray-200",
};

function RecordCard({ record }: { record: DiagnosisRecord }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(record.timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start gap-4">
          {/* Leaf Image Thumbnail */}
          {record.imageUrl ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 border border-border">
              <Image
                src={record.imageUrl}
                alt={record.diagnosis?.disease || "Crop image"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex flex-col items-center justify-center flex-shrink-0 border border-border">
              <ImageIcon className="w-5 h-5 text-muted-foreground/50 mb-1" />
              <span className="text-[10px] text-muted-foreground/60 uppercase">No image</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-xs text-muted-foreground capitalize">
                {record.diagnosis?.crop || "Unknown crop"}
              </span>
              <span className="text-xs text-muted-foreground">· {date}</span>
            </div>
            <h3 className="font-semibold text-sm leading-snug truncate">
              {record.diagnosis?.disease || "Unknown disease"}
            </h3>
            <p className="text-xs font-malayalam text-muted-foreground line-clamp-1">
              {record.diagnosis?.malayalam_disease}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge
              className={`text-[10px] px-2 py-0 border ${severityColor[record.diagnosis?.severity || "unknown"]}`}
            >
              {record.diagnosis?.severity || "—"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Hide" : "View"}
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Confidence bar */}
        {record.diagnosis?.confidence !== undefined && (
          <div className="flex items-center gap-2 pt-1 border-t mt-2">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground w-16">
              Confidence
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  record.diagnosis.confidence > 85 ? "bg-green-500" : record.diagnosis.confidence > 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${record.diagnosis.confidence}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">
              {record.diagnosis.confidence}%
            </span>
          </div>
        )}

        {expanded && (
          <div className="pt-3 mt-1 border-t animate-in fade-in zoom-in-95 duration-200">
            <ResultsPanel result={record} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user, loginWithGoogle } = useAuth();
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setRecords([]);
      setSearched(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setSearched(false);

    try {
      const res = await fetch(`/api/history?uid=${user.uid}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to fetch history");
        return;
      }

      setRecords(data.records || []);
      setSearched(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Diagnosis History</h1>
            <p className="text-muted-foreground text-sm font-malayalam">
              നിങ്ങളുടെ മുൻ രോഗ നിർണ്ണയങ്ങൾ കാണൂ
            </p>
          </div>

          {/* Authentication Wall */}
          {!user ? (
            <Card className="border-green-400/30 bg-green-50/50 dark:bg-green-950/20 text-center py-6 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex flex-col items-center justify-center mx-auto mb-2">
                  <UserIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Please sign in</h2>
                  <p className="text-muted-foreground text-sm font-malayalam">
                    ചരിത്രം പരിശോധിക്കാൻ ലോഗിൻ ചെയ്യുക
                  </p>
                </div>
                <Button onClick={loginWithGoogle} className="gap-2 px-8 bg-green-600 hover:bg-green-700">
                  <UserIcon className="w-4 h-4" />
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Loading skeletons */}
              {loading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-16 h-16 rounded-xl border" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="w-32 h-4" />
                            <Skeleton className="w-48 h-5" />
                            <Skeleton className="w-full h-2 mt-4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && searched && records.length === 0 && (
                <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No diagnoses found</p>
                  <p className="text-sm font-malayalam mt-1">
                    നിങ്ങളുടെ അക്കൗണ്ടിൽ രോഗനിർണ്ണയങ്ങളൊന്നും ഇല്ല
                  </p>
                </div>
              )}

              {/* Record List */}
              {!loading && records.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Found {records.length} diagnosis{records.length !== 1 ? "es" : ""}
                    </p>
                    <Badge variant="outline" className="font-medium opacity-50">
                      {user.email}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {records.map((r) => (
                      <RecordCard key={r.id || r.timestamp} record={r} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
