<div align="center">
  <!-- LOGO -->
  <img width="200" alt="Oneiros Logo" src="public/logo.svg" />
  
  <h1>Oneiros Journal</h1>
  
  <p>
    <strong>A multi-modal dream journal to capture, visualize, and decode your inner subconscious through voice, AI-generated surrealist art, and Jungian analysis.</strong>
  </p>

  <p>
    <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white" alt="React"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-12.13-FFCA28?logo=firebase&logoColor=black" alt="Firebase"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)

## 📸 Screenshots

<p align="center">
  <img src="./screenshots/home_page.png" alt="A screenshot of the Oneiros application welcome screen." width="49%">
  <img src="./screenshots/gallery.png" alt="A screenshot of the Oneiros application interface showing the dream archive." width="49%">
</p>

## ✨ Features

- 🎙️ **Multi-Modal Capture:** Narrate your journey via voice or document it through manual text entry.
- ⚡ **Background Processing:** Dreams are saved instantly and analyzed asynchronously, allowing you to browse your archive while visuals and interpretations are being architected.
- 🧠 **Jungian Analysis:** Decode hidden meanings using advanced Gemini-powered psychological analysis.
- 🎨 **Surrealist Visualizations:** Generate unique digital artwork inspired by your dream's theme.
- 💬 **Interactive Dream Chat:** Ask questions and explore specific symbols in your recorded dreams.
- ☁️ **Cloud Sync:** Securely store and retrieve your nocturnal journeys securely with Firebase.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Motion (Framer Motion)
- **Backend & Auth:** Firebase (Authentication, Firestore)
- **AI Models:** Google GenAI SDK (`gemini-3-flash-preview`, `gemini-2.5-flash-image`)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and configured before proceeding:

- Node.js (v18 or higher recommended)
- A Google Gemini API Key
- A Firebase Project configured with Authentication (Google Sign-in) and Firestore

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/oneiros-journal.git
   cd oneiros-journal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:

   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   FIREBASE_API_KEY="your_firebase_api_key"
   FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   FIREBASE_PROJECT_ID="your_firebase_project_id"
   FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
   FIREBASE_APP_ID="your_firebase_app_id"
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the Apache License 2.0.
