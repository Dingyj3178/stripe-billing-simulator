import differenceInDays from "date-fns/differenceInDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInMonths from "date-fns/differenceInMonths";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";

import previousMonday from "date-fns/previousMonday";
import previousSunday from "date-fns/previousSunday";
import isSunday from "date-fns/isSunday";

import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import getDate from "date-fns/getDate";

export const eventPointCalculator = (parameter) => {
  let timeline = "";

  const endDate =
    parameter.billing_cycle_anchor !== null
      ? parameter.billing_cycle_anchor
      : parameter.trial_end !== null
      ? parameter.trial_end
      : parameter.create_date;

  const updateDate =
    parameter.interval === "year"
      ? addDays(new Date(endDate), parameter.interval_count * 365)
      : parameter.interval === "month"
      ? addMonths(new Date(endDate), parameter.interval_count * 1)
      : parameter.interval === "week"
      ? addDays(new Date(endDate), parameter.interval_count * 7)
      : addDays(new Date(endDate), parameter.interval_count);
  const timelineStart =
    parameter.interval === "day"
      ? parameter.create_date
      : parameter.interval === "week"
      ? isSunday(parameter.create_date)
        ? parameter.create_date
        : previousSunday(parameter.create_date)
      : parameter.interval === "year"
      ? new Date(parameter.create_date.getFullYear(), 1, 1)
      : new Date(
          parameter.create_date.getFullYear(),
          parameter.create_date.getMonth(),
          1
        );

  // const updatePoint = differenceInDays(updateDate, timelineStart);
  const updatePoint =
    parameter.interval === "day"
      ? differenceInCalendarDays(updateDate, timelineStart)
      : differenceInMonths(updateDate, timelineStart) * 30 +
        differenceInDays(
          updateDate,
          addMonths(
            timelineStart,
            differenceInMonths(updateDate, timelineStart)
          )
        );
  const startPoint = differenceInDays(
    getDate(parameter.create_date) === 31
      ? addDays(parameter.create_date, -1)
      : parameter.create_date,
    timelineStart
  );
  const billingPoint =
    parameter.billing_cycle_anchor === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.billing_cycle_anchor, timelineStart)
      : differenceInMonths(
          getDate(parameter.billing_cycle_anchor) === 31
            ? addDays(parameter.billing_cycle_anchor, -1)
            : parameter.billing_cycle_anchor,
          timelineStart
        ) *
          30 +
        differenceInDays(
          getDate(parameter.billing_cycle_anchor) === 31
            ? addDays(parameter.billing_cycle_anchor, -1)
            : parameter.billing_cycle_anchor,
          addMonths(
            timelineStart,
            differenceInMonths(
              getDate(parameter.billing_cycle_anchor) === 31
                ? addDays(parameter.billing_cycle_anchor, -1)
                : parameter.billing_cycle_anchor,
              timelineStart
            )
          )
        );
  const trialEndPoint =
    parameter.trial_end === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.trial_end, timelineStart)
      : differenceInMonths(
          getDate(parameter.trial_end) === 31
            ? addDays(parameter.trial_end, -1)
            : parameter.trial_end,
          timelineStart
        ) *
          30 +
        differenceInDays(
          getDate(parameter.trial_end) === 31
            ? addDays(parameter.trial_end, -1)
            : parameter.trial_end,
          addMonths(
            timelineStart,
            differenceInMonths(
              getDate(parameter.trial_end) === 31
                ? addDays(parameter.trial_end, -1)
                : parameter.trial_end,
              timelineStart
            )
          )
        );
  // const trialEndPoint = differenceInDays(parameter.trial_end, timelineStart);

  switch (parameter.interval) {
    case "month":
      timeline =
        differenceInCalendarMonths(
          new Date(
            endDate.getFullYear(),
            endDate.getMonth() + parameter.interval_count * 1 + 2,
            1
          ),
          endDate
        ) *
          30 +
        differenceInCalendarMonths(endDate, timelineStart) * 30;

      break;
    case "year":
      timeline =
        differenceInCalendarYears(
          new Date(
            endDate.getFullYear() + parameter.interval_count * 1 + 1,
            endDate.getMonth(),
            1
          ),
          timelineStart
        ) * 365;
      break;
    case "week":
      timeline = differenceInCalendarDays(
        new Date(endDate).setDate(
          endDate.getDate() + parameter.interval_count * 7 + 14
        ),
        parameter.create_date
      );
      break;
    case "day":
      timeline = differenceInCalendarDays(
        new Date(endDate).setDate(
          endDate.getDate() + parameter.interval_count * 1 + 1
        ),
        parameter.create_date
      );
      break;
    default:
      365;
  }

  return {
    timeline,
    updatePoint,
    startPoint,
    billingPoint,
    trialEndPoint,
  };
};

export const widthCalculator = (eventPoint, windowWidth) => {
  const width1 =
    (windowWidth - 6) * (eventPoint.startPoint / eventPoint.timeline) -
      48 +
      6 +
      48 <
    0
      ? 0
      : (windowWidth - 6) * (eventPoint.startPoint / eventPoint.timeline) -
        48 +
        6 +
        48;
  const width2 =
    (windowWidth - 6) * (eventPoint.trialEndPoint / eventPoint.timeline) -
      48 +
      6 -
      96 -
      width1 +
      48 >
    0
      ? (windowWidth - 6) * (eventPoint.trialEndPoint / eventPoint.timeline) +
        6 -
        48 -
        96 -
        width1 +
        48
      : 0;
  const width3 =
    (windowWidth - 6) * (eventPoint.billingPoint / eventPoint.timeline) -
      48 +
      6 -
      96 -
      96 * (eventPoint.trialEndPoint === 0 ? 0 : 1) -
      width1 -
      width2 +
      48 >
    0
      ? (windowWidth - 6) * (eventPoint.billingPoint / eventPoint.timeline) -
        48 +
        6 -
        96 -
        96 * (eventPoint.trialEndPoint === 0 ? 0 : 1) -
        width1 -
        width2 +
        48
      : 0;
  const width4 =
    (windowWidth - 6) * (eventPoint.updatePoint / eventPoint.timeline) -
    48 +
    6 -
    96 -
    96 * (eventPoint.trialEndPoint === 0 ? 0 : 1) -
    96 * (eventPoint.billingPoint === 0 ? 0 : 1) -
    width1 -
    width2 -
    width3 +
    48;
  return {
    width1,
    width2,
    width3,
    width4,
  };
};
