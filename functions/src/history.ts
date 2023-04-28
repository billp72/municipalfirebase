import * as admin from "firebase-admin";
import ALERT from "./alertInterface";
//import { uuid } from 'uuidv4';


const myHistory = (alert: ALERT, db:any) => {
  const d = db.collection("history");
  const child = d.doc(alert.uid);
  return child
    .set(
      {
        [alert.type]: admin.firestore.FieldValue.arrayUnion({
          desc: `${alert.title} ${alert.body}`,
          date: alert.date,
          type: alert.type,
        }),
      },
      { merge: true }
    )
    .then(async () => {
    
        return true;
    })
    .catch((err: any) => console.log(err + " history not set"));
};

const adminHistory = (alert: ALERT, db:any) => {
  const d = db.collection("history");
  const child = d.doc(alert.admin_uid);
  return child
    .set(
      {
        [alert.type]: admin.firestore.FieldValue.arrayUnion({
          desc: `${alert.title} ${alert.body}`,
          date: alert.date,
          type: alert.type,
        }),
      },
      { merge: true }
    )
    .then(async () => {
        return true;
    })
    .catch((err: any) => console.log(err + " history not set"));
};

export { adminHistory, myHistory };
