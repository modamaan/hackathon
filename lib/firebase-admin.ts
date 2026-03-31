import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app: App;

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const adminKey = process.env.FIREBASE_ADMIN_KEY;
  if (!adminKey) {
    throw new Error("FIREBASE_ADMIN_KEY environment variable is not set");
  }

  const parsedKey = JSON.parse(adminKey);
  if (parsedKey.private_key) {
    parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, "\n");
  }

  return initializeApp({
    credential: cert(parsedKey),
  });
}

export function getAdminDb() {
  app = initAdmin();
  return getFirestore(app);
}
