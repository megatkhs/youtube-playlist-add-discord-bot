import cron from "node-cron";

function setMonthlySchedule(callback: () => void) {
  cron.schedule("0 0 1 * *", callback, {
    timezone: "Asia/Tokyo",
  });
}

export { setMonthlySchedule };
