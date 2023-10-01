import cron from "node-cron";

function setMonthlySchedule(callback: (now: Date) => void) {
  cron.schedule("30 15 1 * *", async (now) => {
    if (now instanceof Date) {
      callback(now);
    }
  });
}

export { setMonthlySchedule };
