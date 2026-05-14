import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// 1. Attempt to load local config (AI Studio / Development)
// Using a wildcard (*) prevents Vite from failing the build if the file is missing (e.g. on Vercel)
const configs = import.meta.glob('../../firebase-applet-config*.json', { eager: true });
const localConfig = (Object.values(configs)[0] as { default?: FirebaseConfig } | undefined)?.default || {};

// 2. Prioritize Environment Variables (Vercel / Production)
const finalConfig: FirebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: import.meta.env.FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId,
};

// 3. Prevent crashing on initialization if keys are missing (helpful for early deployment steps)
if (!finalConfig.apiKey) {
  console.warn("Firebase Configuration missing! If you are on Vercel, set your FIREBASE_* environment variables. If you are in AI Studio, ensure Firebase is set up.");
}

const app = initializeApp(finalConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, finalConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  if (!finalConfig.apiKey) return;
  try {
    // Attempt to read a specific path to check connectivity and permissions
    await getDocFromServer(doc(db, 'dreams', 'health-check'));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Firebase connection failed: The client is offline. This usually means the API key is missing or the current domain is not authorized in the Firebase Console (Authentication > Settings > Authorized Domains).");
      } else if (error.message.includes('permission-denied')) {
        // This is actually a GOOD sign - it means we reached the server but were rejected by rules (as expected for a random doc)
        console.log("Firebase connection established (Rules enforced).");
      } else {
        console.warn("Firebase connection check produced an unexpected error:", error.message);
      }
    }
  }
}
testConnection().catch(console.error);
