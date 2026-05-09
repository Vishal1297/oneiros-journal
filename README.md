<div align="center">
<!-- LOGO PLACEHOLDER -->
<img width="200" height="200" alt="Oneiros Logo" src="https://images.unsplash.com/photo-1541339907198-e08759df9a04?w=400&h=400&fit=crop" style="border-radius: 50%" />
</div>

# Oneiros Journal

A multi-modal dream journal to capture, visualize, and decode your inner subconscious through voice, AI-generated surrealist art, and Jungian analysis.

## ✨ Features

- **Voice Capture:** Speak your dreams and let the app transcribe them accurately using device microphones.
- **Jungian Analysis:** Decode hidden meanings using advanced Gemini-powered psychological analysis.
- **Surrealist Visualizations:** Generate unique digital artwork inspired by your dream's theme.
- **Interactive Dream Chat:** Ask questions and explore specific symbols in your recorded dreams.
- **Cloud Sync:** Securely store and retrieve your nocturnal journeys with Firebase.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Motion (Framer Motion)
- **Backend & Auth:** Firebase (Authentication, Firestore)
- **AI Models:** Google Gemini (`gemini-3-flash-preview`, `gemini-2.5-flash-image`)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key
- A Firebase Project configured with Authentication and Firestore

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:

   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
   VITE_FIREBASE_APP_ID="your_firebase_app_id"
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the Apache License 2.0.
