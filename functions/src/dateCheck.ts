import ALERT from "./alertInterface";

function hasKey<O extends Object>(obj: O, key: keyof any): key is keyof O {
    return key in obj;
  }

  const getWeek = (date: Date) => {
    const janFirst = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - janFirst.getTime()) / 86400000) + janFirst.getDay() + 1) / 7);
  }

  interface DATECHECKER {
    all: (a: ALERT) => ALERT;
    daily: (a: ALERT) => ALERT | any;
    weekly: (a: ALERT) => ALERT | any;
    monthly: (a: ALERT) => ALERT | any;
  }
  
const createDate = (timeEdited: Date) => {
    return timeEdited.toLocaleString("en-US", { timeZone: "America/New_York" });
  };

const formateDate = (dateOfEvent: string) => {
    return dateOfEvent.replace(
      /(\d+)-(\d+)-(\d+)/,
      (m: any, v1: any, v2: any, v3: any): string => {
        return `${v2}/${v3}/${v1}`;
      }
    );
  };

const dateCheck = (alert:ALERT) => {
  const timeFromLastAlert:DATECHECKER = {
    all: function (a:ALERT):ALERT {
        return a;
    },
    daily: function (a:ALERT):ALERT | any {
        let event = new Date(formateDate(a.date)).getTime(),
        now = createDate(new Date()),
        diff = event - new Date(now.split(",")[0]).getTime(),
        differenceInDays = diff / (24 * 3600 * 1000);

        if(!a?.start || (Math.round(differenceInDays) >= 1)){
            return a;
        }
    },
    weekly: function (a:ALERT):ALERT | any {
        let event = new Date(formateDate(a.date));
        let now = new Date();

        if(!a?.start || (getWeek(event) != getWeek(now))){
            return a;
        }
    },
    monthly: function (a:ALERT):ALERT | any {
        let event = new Date(formateDate(a.date)).getMonth();
        let now = new Date().getMonth();

        if(!a?.start || (event != now)){
            return a;
        }
    },
  };
 const check = () => {
    const f = alert.frequency
    if (hasKey(timeFromLastAlert, f)) {
        return timeFromLastAlert[f](alert);
    }
 }
 return Object.freeze({
    check
  });
};

export default dateCheck;
