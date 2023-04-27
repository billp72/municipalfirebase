const nodemailer = require("nodemailer");
import ALERT from "./alertInterface";

const email = (alert: ALERT) => {
  let transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true, // true for 465, false for other ports
    auth: {
      //...config.email,
    },
  });

  const retry = async (
    event: ALERT,
    retries = 3,
    backoff = 300
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: '"Stock Alarm" <test@gege.com>',
          to: event.email,
          subject: event.title,
          html: event.body,
        },
        (err: any, info: any) => {
          if (err) {
            if (retries > 0) {
              setTimeout(() => {
                return resolve(retry(event, retries - 1, backoff * 2));
              }, backoff);
            } else {
              return reject(err);
            }
          } else {
            //TODO add to history
            let msg = "completed";
            return resolve(msg);
          }
        }
      );
    });
  };
  return retry(alert);
};

export default email;
