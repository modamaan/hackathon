# FarmBot (നിങ്ങളുടെ കൃഷിക്ക് AI സഹായം) 🌿🤖

<img width="1919" height="864" alt="Screenshot 2026-03-31 161148" src="https://github.com/user-attachments/assets/f84e0102-e73e-4ac6-b5f0-888931582384" />

<img width="1901" height="869" alt="Screenshot 2026-03-31 161212" src="https://github.com/user-attachments/assets/caf03e58-eadd-4537-a682-e28941820286" />



https://github.com/user-attachments/assets/3384201c-677e-463c-9e44-3ecb660faf3f





FarmBot is an AI-powered agricultural assistant designed specifically for farmers in Kerala. It leverages state-of-the-art vision models and live weather data to provide instant diagnoses for crop diseases, delivering highly personalized and weather-aware treatment plans in Malayalam.

## ✨ Key Features

- **📸 Instant Gen-AI Diagnosis:** Upload a photo of a diseased leaf and let Gemini 2.0 Flash analyze it within seconds to identify the disease, crop type, and its severity.
- **☁️ Weather-Aware Precaution Plans:** Fetches real-time temperature, humidity, and a 5-day forecast using the Google Maps Weather API, then adapts the treatment steps accordingly to match the current local climate conditions.
- **🎙️ Malayalam Voice Support:** Speak your queries directly in Malayalam. The app utilizes Google Speech-to-Text to transcribe your voice notes, and Gemini responds with personalized advice.
- **📍 Location Intelligence (GPS):** One-tap location sharing maps problems exactly to your village/region for highly localized assistance.
- **🛡️ Comprehensive Treatment Options:** Offers actionable guidance covering both **Organic** and **Chemical** methodologies, complete with exact dosage instructions.
- **💾 Secured History:** Every diagnosis is safely stored on Firebase, tied to your phone number, ensuring past treatments can always be reviewed easily.

## 🛠️ Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI & Styling:** React 19, [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **AI/ML:** Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Backend & Database:** Firebase Auth & Firestore (via `firebase` and `firebase-admin`)
- **Location & Weather Data:** Google Maps API (Geocoding & Weather API)
- **Deployment:** Docker support out of the box (`Dockerfile` included)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- A Firebase Project (with Firestore and Authentication enabled)
- A Google Cloud Project (with Gemini API and Google Maps API enabled)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the following keys. Make sure to replace the placeholder values with your actual credentials.

   ```env
   # --- Firebase Public Variables ---
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

   # --- Firebase Admin SDK (JSON stringified) ---
   FIREBASE_ADMIN_KEY='{"projectId":"...","private_key":"...","client_email":"..."}'

   # --- AI & Location APIs ---
   GEMINI_API_KEY="your-gemini-api-key"
   GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the App:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🐳 Docker Setup

This project comes with a built-in `Dockerfile` for seamless containerized deployment.

1. **Build the image:**
   ```bash
   docker build -t farmbot .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 --env-file .env.local farmbot
   ```

## 🤝 Contribution
Contributions, issues, and feature requests are welcome!

---
*Built with ❤️ for Kerala's agricultural community.*
