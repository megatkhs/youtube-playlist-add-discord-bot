import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

function dayjsWithTimezone(date?: dayjs.ConfigType) {
  return dayjs(date).tz();
}

export { dayjsWithTimezone as dayjs };
