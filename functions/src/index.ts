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
  municipality: "",
};

const resident = {
  admin: false,
  municipality: "",
};
export const adminLevel = functions.https.onCall(async (request, response) => {
  administer.municipality = request.municipality;

  await auth.setCustomUserClaims(request.uid, administer);
  const user: any = await auth.getUser(request.uid);
  const municipal = user["customClaims"]["municipality"];
  const docref = db.collection("users").doc(municipal);
  request.admin = true;
  docref.set(
    {
      [request.uid]: {
        ...request,
      },
    },
    { merge: true }
  );

  return user;
});

export const residentLevel = functions.https.onCall(
  async (request, response) => {
    resident.municipality = request.municipality;

    await auth.setCustomUserClaims(request.uid, resident);
    const user: any = await auth.getUser(request.uid);
    const municipal = user["customClaims"]["municipality"];
    const docref = db.collection("users").doc(municipal);
    request.admin = false;
    docref.set(
      {
        [request.uid]: {
          ...request,
        },
      },
      { merge: true }
    );

    return user;
  }
);

export const getCustomClaim = functions.https.onCall(async (data, context) => {
  const operatorUser = await admin.auth().getUser(data.uid);
  return operatorUser?.customClaims || "";
});

export const getUserAlerts = functions.https.onCall(async (data, context) => {
  const docRef = db.collection("topics");
  const all = [];
  let snapshot = await docRef.get();
  let arr = snapshot.docs.map((doc) => {
    return doc.data();
  });
  for (let itm in arr) {
    for (let b in arr[itm]) {
      if (b === data.uid) {
        all.push(arr[itm][b]);
      }
    }
  }
  if (all.length > 0) all.unshift({ date: {} });

  return all;
});

export const addAlerts = functions.https.onCall(async (data, context) => {
  const database: any = db.collection("topics");
  const d = data.data;
  try{
    for(let i=0; i<d.length; i++){
      const docref = database.doc(d[i].type);
      docref.set(
        {
          [d[i].uid]: {
            ...d[i],
          },
        },
        { merge: true }
      );
    }
    return true;
  }catch(e){
    return false;
  }
  
});

export const checkAlerts = functions.https.onCall(async (data, context) => {
  const database: any = db.collection("topics");
  const docref = database.doc(data.type);
  try{
    const res = await docref.get();
    const d = docref.data();
    if(res.exists){
      if(data["uid"] in d){
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }catch(e){
    return false;
  }

});