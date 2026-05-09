import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Fallback for local development or AI Studio where the file exists
let fallbackConfig = {};
try {
  // @ts-ignore
  const config = await import('../../firebase-applet-config.json');
  fallbackConfig = config.default || config;
} catch (e) {
  // Ignore if file doesn't exist
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

// Merge: Prioritize Env Vars, then JSON fallback
const finalConfig: any = {
  apiKey: firebaseConfig.apiKey || (fallbackConfig as any).apiKey,
  authDomain: firebaseConfig.authDomain || (fallbackConfig as any).authDomain,
  projectId: firebaseConfig.projectId || (fallbackConfig as any).projectId,
  storageBucket: firebaseConfig.storageBucket || (fallbackConfig as any).storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId || (fallbackConfig as any).messagingSenderId,
  appId: firebaseConfig.appId || (fallbackConfig as any).appId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || (fallbackConfig as any).firestoreDatabaseId,
};

const app = initializeApp(finalConfig);
export const db = initializeFirestore(app, {
  databaseId: finalConfig.firestoreDatabaseId || '(default)',
  forceLongPolling: true,
});
export const auth = getAuth(app);

// Connectivity check as per skill instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
