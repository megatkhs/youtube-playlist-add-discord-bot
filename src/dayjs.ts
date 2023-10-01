import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function dayjsWithTimezone(date?: dayjs.ConfigType) {
  return dayjs(date).tz("Asia/Tokyo");
}

export { dayjsWithTimezone as dayjs };
