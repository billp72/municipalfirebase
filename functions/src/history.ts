import * as admin from "firebase-admin";
import ALERT from "./alertInterface";

const formateDate = (dateOfEvent: string) => {
  return dateOfEvent.replace(
    /(\d+)-(\d+)-(\d+)/,
    (m: any, v1: any, v2: any, v3: any): string => {
      return `${v2}/${v3}/${v1}`;
    }
  );
};


const myHistory = (alert: ALERT, db:any) => {
  const topicsdb: any = db.collection("topics");
  const topicsref = topicsdb.doc(alert.type);

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
      
      const res = await topicsref.get();
      if (!res.exists) {
        return false;
      }
      const data = res.data();
      const content = data[alert.uid];
      const date = new Date().toISOString().slice(0, 10);
      const updatedFields = { ...content, ...{date: formateDate(date)} };
      await topicsref.update({
        [alert.uid]: {
          ...updatedFields,
        },
      });
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
        all: admin.firestore.FieldValue.arrayUnion({
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
