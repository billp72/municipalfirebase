//import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import ALERT from "./alertInterface";
import { myHistory } from "./history";

const push = (alert: ALERT, db:any) => {
  const notification = {
    title: alert.title,
    body: alert.body,
    sound: "default",
    badge: "1",
  };

  const retry = async (
    msg: any,
    event: ALERT,
    retries = 3,
    backoff = 300
  ): Promise<any> => {
    return admin
      .messaging()
      .sendToDevice(event.token, msg, { timeToLive: 86400, priority: "high" })
      .then(function (response) {
        myHistory(event, db);
        return event;
      })
      .catch((e) => {
        if (retries > 0) {
          return setTimeout(() => {
            return retry(msg, event, retries - 1, backoff * 2);
          }, backoff);
        } else {
          return e;
        }
      });
    
  };
  return retry(notification, alert);
};

export default push;
