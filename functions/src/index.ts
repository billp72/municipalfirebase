import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
const administer = {
  admin: true,
  municipality: ""
}

const resident = {
  admin: false,
  municipality: ""
}
export const adminLevel = functions.https.onCall(async(request, response) => {
  administer.municipality = request.municipality;
  
  await auth.setCustomUserClaims(request.uid,  administer);
  const user:any = await auth.getUser(request.uid)
  const municipal = user['customClaims']['municipality'];
  const docref = db.collection('users').doc(municipal);
  request.admin = true;
  docref.set({[request.uid]:{
    ...request
  }}, {merge:true})

  return user;
});

export const residentLevel = functions.https.onCall(async(request, response) => {
  resident.municipality = request.municipality;

  await auth.setCustomUserClaims(request.uid,  resident);
  const user:any = await auth.getUser(request.uid)
  const municipal = user['customClaims']['municipality'];
  const docref = db.collection('users').doc(municipal);
  request.admin = false;
  docref.set({[request.uid]:{
    ...request
  }}, {merge:true})

  return user;
});

export const getCustomClaim = functions.https.onCall(async(data, context) => {
  const operatorUser = await admin.auth().getUser(data.uid);
  return operatorUser?.customClaims || "";
})