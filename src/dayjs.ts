import dayjs from "dayjs";

function dayjsWithTimezone(date?: dayjs.ConfigType) {
  return dayjs(date).add(9, "hour");
}

export { dayjsWithTimezone as dayjs };
