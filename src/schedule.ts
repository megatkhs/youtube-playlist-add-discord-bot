import cron from "node-cron";
import { dayjs } from "./dayjs";

function setMonthlySchedule(callback: (now: Date) => void) {
  cron.schedule(
    "00 16 1 * *",
    async (now) => {
      if (now instanceof Date) {
        callback(dayjs(now).subtract(9, "hour").toDate());
      }
    },
    {
      timezone: "Asia/Tokyo",
    }
  );
}

export { setMonthlySchedule };
