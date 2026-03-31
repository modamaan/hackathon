// run with: node set-cors.js
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

async function setCors() {
  const adminKeyRaw = process.env.FIREBASE_ADMIN_KEY;
  if (!adminKeyRaw) {
    console.error("❌  FIREBASE_ADMIN_KEY not found in .env.local");
    process.exit(1);
  }

  const credentials = JSON.parse(adminKeyRaw);
  // Unescape \\n → real newlines in the private key (same as firebase-admin.ts)
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  const storage = new Storage({ credentials });

  const bucketName = "farmer-93508.firebasestorage.app";
  const corsConfig = [
    {
      origin: ["*"],
      method: ["GET", "POST", "PUT", "DELETE", "HEAD"],
      maxAgeSeconds: 3600,
      responseHeader: ["Content-Type", "Authorization", "x-goog-resumable"],
    },
  ];

  await storage.bucket(bucketName).setCorsConfiguration(corsConfig);
  console.log(`✅  CORS updated for bucket: ${bucketName}`);
}

setCors().catch(console.error);
