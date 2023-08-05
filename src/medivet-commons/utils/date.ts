import moment from "moment";

export const parseTimeStringToDate = (time: string, showSeconds?: boolean): Date => {
    const timeParts = time.split(":");
    const hour = timeParts[0] ? Number(timeParts[0]) : undefined;
    const minutes = timeParts[1] ? Number(timeParts[1]) : undefined;
    const seconds = timeParts[2] && showSeconds ? Number(timeParts[2]) : undefined;
    const date = moment().toDate();

    if (hour !== undefined) date.setHours(hour);
    if (minutes !== undefined) date.setMinutes(minutes);
    if (seconds !== undefined) date.setSeconds(seconds);
    else date.setSeconds(0);

    return date;
};
