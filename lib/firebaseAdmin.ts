import {cert, getApps, initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

// FIREBASE_SERVICE_ACCOUNT holds the service account key JSON (Firebase console →
// Project settings → Service accounts). Without it, fall back to the host's default credentials.
function adminApp() {
	if (getApps().length) return getApps()[0];
	const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
	return initializeApp(serviceAccount ? {credential: cert(JSON.parse(serviceAccount))} : undefined);
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());
