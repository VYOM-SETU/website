import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e.stack);
  }
}

export const db = admin.firestore();
export const authAdmin = admin.auth();
export default admin;