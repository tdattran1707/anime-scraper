import admin from "firebase-admin";
import jsonfile from "jsonfile";
//When deploying to firebase, we don't need serviceAccount to authenticate
//Firebase will automatically do that for us
//Initializing app
const serviceAccount = jsonfile.readFileSync(
  "/Users/dattran/Documents/serviceAccount.json"
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
export const db = admin.firestore();
export const collectionRef = db.collection("anime-vietsub");
