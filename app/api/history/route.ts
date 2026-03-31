import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { error: "Valid user UID is required to fetch history" },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("farmers")
      .doc(uid)
      .collection("diagnoses")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({ records });
  } catch (error: any) {
    console.error("History fetch error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch history" },
      { status: 500 }
    );
  }
}
