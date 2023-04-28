import ALERT from "./alertInterface";
import { myHistory } from "./history";

const sms = (alert: ALERT, db:any) => {
  const notification = `${alert.title} ${alert.body}`;
  //TODO install twillio
  const messages = { create: (obj: any) => new Promise(() => null) };

  const retry = async (
    msg: any,
    event: ALERT,
    retries = 3,
    backoff = 300
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      messages
        .create({
          body: msg,
          from: "+12398806109",
          to: event.phone,
        })
        .then((message: any) => {
          myHistory(event, db);
          return resolve(event);
        })
        .catch((err: any) => {
          if (retries > 0) {
            setTimeout(() => {
              return resolve(retry(msg, event, retries - 1, backoff * 2));
            }, backoff);
          } else {
            return reject(err);
          }
        });
    });
  };
  return retry(notification, alert);
};

export default sms;
