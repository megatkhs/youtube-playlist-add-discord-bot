import cron from "node-cron";

function setMonthlySchedule(callback: (now: Date) => void) {
  cron.schedule(
    "45 15 1 * *",
    async (now) => {
      if (now instanceof Date) {
        callback(now);
      }
    },
    {
      timezone: "Asia/Tokyo",
    }
  );
}

export { setMonthlySchedule };
