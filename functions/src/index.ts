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
  //functions.logger.info("Hello logs!", {structuredData: true});
  const claims = administer.municipality = request.municipality;
  await auth.setCustomUserClaims(request.uid,  claims);
  const user:any = await auth.getUser(request.uid);
  db.collection('users').doc('/'+user.customClaims['municipality']+'/').update({[request.uid]:{
    ...request
  }})
  return user;
});

export const residentLevel = functions.https.onCall(async(request, response) => {
  //functions.logger.info("Hello logs!", {structuredData: true});
  const claims = resident.municipality = request.municipality;
  await auth.setCustomUserClaims(request.uid,  claims);
  const user:any = await auth.getUser(request.uid)
  db.collection('users').doc('/'+user.customClaims['municipality']+'/').update({[request.uid]:{
    ...request
  }})
  return user;
});

export const getCustomClaim = functions.https.onCall(async(data, context) => {
  const operatorUser = await admin.auth().getUser(data.uid);
  return operatorUser.customClaims;
})