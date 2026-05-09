import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// 1. Attempt to load local config (AI Studio / Development)
// Using a wildcard (*) prevents Vite from failing the build if the file is missing (e.g. on Vercel)
const configs = import.meta.glob('../../firebase-applet-config*.json', { eager: true });
const localConfig = (Object.values(configs)[0] as any)?.default || {};

// 2. Prioritize Environment Variables (Vercel / Production)
const finalConfig: any = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId,
};

// 3. Prevent crashing on initialization if keys are missing (helpful for early deployment steps)
if (!finalConfig.apiKey) {
  console.warn("Firebase Configuration missing! If you are on Vercel, set your VITE_FIREBASE_* environment variables. If you are in AI Studio, ensure Firebase is set up.");
}

const app = initializeApp(finalConfig);
export const db = initializeFirestore(app, {
  databaseId: finalConfig.firestoreDatabaseId || '(default)',
  forceLongPolling: true,
});
export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  if (!finalConfig.apiKey) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase connection failed: Check your configuration and Authorized Domains in Firebase Console.");
    }
  }
}
testConnection();
