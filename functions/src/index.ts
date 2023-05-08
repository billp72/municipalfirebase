import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import push from "./push";
import email from "./email";
import dateCheck from "./dateCheck";
import ALERT from "./alertInterface";
import { adminHistory } from "./history";

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

const administer = {
  admin: true,
  municipality: "",
};

const resident = {
  admin: false,
  municipality: "",
};

export const checkAdmin = functions.https.onCall(async (request, response) => {
  const mun = request.municipality
  const docref = db.collection("users").doc(mun);
  const doc = await docref.get();
  return doc.exists
});

export const adminLevel = functions.https.onCall(async (request, response) => {
  administer.municipality = request.municipality;

  await auth.setCustomUserClaims(request.uid, administer);
  const user: any = await auth.getUser(request.uid);
  const municipal = user["customClaims"]["municipality"];

  const colcity = db.collection("cities");
  const city = colcity.doc("city");

  const colstate = db.collection("states");
  const state = colstate.doc("state");

  const docref = db.collection("users").doc(municipal);
  request.admin = true;
  try {
      docref
        .set(
          {
            [request.uid]: {
              ...request,
            },
          },
          { merge: true }
        )
        .then(() => {
          return city
            .set(
              {
                ["all"]: admin.firestore.FieldValue.arrayUnion(request.city),
              },
              { merge: true }
            )
            .then(() => {
              return state.set(
                {
                  ["all"]: admin.firestore.FieldValue.arrayUnion(request.state),
                },
                { merge: true }
              );
            })
            .catch((err: any) => console.log(err + " city/state not set"));
        });
   
  } catch (error) {
    return null;
  }
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

export const getUserDetails = functions.https.onCall(async (data, context) => {
  const docID = data.municipality;
  const uid = data.uid;
  try {
    const docref = db.collection("users").doc(docID);
    const doc = await docref.get();

    if (!doc.exists) {
      return {};
    } else {
      const thedata: any = doc.data();
      return thedata[`${uid}`];
    }
  } catch (e) {
    return e;
  }
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
  const promises = [];
  const database: any = db.collection("topics");
  const d = data.data;
  try {
    for (let i = 0; i < d.length; i++) {
      const docref = database.doc(d[i].type);
      const sets = docref.set(
        {
          [d[i].uid]: {
            ...d[i],
          },
        },
        { merge: true }
      );
      promises.push(sets);
    }
    await Promise.all(promises);
    return true;
  } catch (e) {
    return false;
  }
});

export const updateAlert = functions.https.onCall(async (data, context) => {
  const database: any = db.collection("topics");
  const docref = database.doc(data.data.type);
  const res = await docref.get();
  if (!res.exists) {
    return;
  }
  const thedata = data.data;
  const d = res.data();
  const content = d[data.uid];
  const updatedFields = { ...content, ...thedata };
  const p = await docref.update({
    [data.uid]: {
      ...updatedFields,
    },
  });

  if (p) {
    return true;
  }
  return false;
});

export const checkAlerts = functions.https.onCall(async (data, context) => {
  const database: any = db.collection("topics");
  const docref = database.doc(data.type);
  const res = await docref.get();
  if (res.exists) {
    const d = res.data();
    if (data.uid in d) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
});

export const getHistory = functions.https.onCall(async (data, context) => {
  try {
    const database: any = db.collection("history");
    const docref = database.doc(data.uid);
    const res = await docref.get();
    if (res.exists) {
      const d = res.data();
      if (data?.type in d) {
        if (d[data.type].length > 0) d[data.type].unshift({ date: {} });
        return d[data.type];
      } else {
        return [];
      }
    }
  } catch (e) {
    return [];
  }
});

export const getSelection = functions.https.onCall(async (data, context) => {
  const database: any = db.collection("topics");
  const docref = database.doc(data.type);
  const res = await docref.get();
  if (res.exists) {
    const d = res.data();
    if (data?.uid in d) {
      return d[data?.uid];
    }
  }
  return null;
});

export const getCities = functions.https.onCall(async (data, context) => {
  const col = db.collection("cities");
  const child = col.doc("city");
  const docref = await child.get();
  if (docref.exists) {
    const data = docref.data();
    data?.all.unshift("Select city");
    return data?.all;
  } else {
    return ["Select city"];
  }
});

export const getStates = functions.https.onCall(async (data, context) => {
  const col = db.collection("states");
  const child = col.doc("state");
  const docref = await child.get();
  if (docref.exists) {
    const data = docref.data();
    data?.all.unshift("Select state");
    return data?.all;
  } else {
    return ["Select state"];
  }
});

export const PublishEvent = functions.https.onCall(async (data, context) => {
  const muni = data.municipality;
  const topic = data.topic;
  const title = data.title;
  const body = data.body;
  const admin_uid = data.admin_uid;

  let results;

  const users: any = db.collection("users");
  const docref1 = users.doc(muni);
  const res1 = await docref1.get();

  const topics: any = db.collection("topics");
  const docref2 = topics.doc(topic);
  const res2 = await docref2.get();

  if (res1.exists && res2.exists) {
    const d1 = res1.data();
    const d2 = res2.data();
    for (let i in d1) {
      const user = d1[i];
      if (!user.admin) {
        const alert = d2[user.uid];
        if (!!alert && !alert.mute) {
          const combined: ALERT = {
            city: user.city,
            email: user.email,
            phone: user.phone,
            token: user.token,
            admin_uid: admin_uid,
            title: title,
            body: body,
            ...alert,
          };
          const dc = dateCheck(combined);
          results = await sortTopics(dc.check());
        }
      }
    }
    adminHistory(results, db);
    return true;
  }
  return false;
});

function sortTopics(event: ALERT) {
  switch (event.delivery) {
    case "email":
      return email(event, db);
    case "sms":
      console.log(event);
      return null;
    case "push":
      return push(event, db);
    default:
      return null;
  }
}
