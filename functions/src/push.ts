//import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import ALERT from "./alertInterface";

const push = (alert: ALERT) => {
  const notification = {
    title: alert.title,
    body: alert.body,
    sound: "default",
    badge: "1",
  };

  const retry = async (
    msg: any,
    event: any,
    retries = 3,
    backoff = 300
  ): Promise<any> => {
    return admin
      .messaging()
      .sendToDevice(event.push, msg, { timeToLive: 86400, priority: "high" })
      .then(function (response) {
        //TODO: write to history db alert
        return true;
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
  //TODO: check alert against date here
  return retry(notification, alert);
};

export default push;
