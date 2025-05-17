import moment from "moment-timezone";

/**
 * Converts a UTC ISO string to the device's local time.
 * @param utcDateStr - UTC ISO string like "2025-04-30T09:48:20.687Z"
 * @returns Local date string like "2025-04-30 04:48:20"
 */
export function convertUtcToDeviceDate(utcDateStr: string): string {
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const localDate = moment.utc(utcDateStr).tz(deviceTimeZone);
  return localDate.format("YYYY-MM-DD HH:mm:ss");
}

export function convertUtcToDeviceTime(utcDateStr: string): string {
  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const localDate = moment.utc(utcDateStr).tz(deviceTimeZone);
  return localDate.format("hh:mm:ss a");
}
