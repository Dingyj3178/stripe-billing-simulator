import React, { useState, useEffect, useRef } from "react";
import differenceInDays from "date-fns/differenceInDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInMonths from "date-fns/differenceInMonths";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import previousMonday from "date-fns/previousMonday";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import dynamic from "next/dynamic";
import { useXarrow } from "react-xarrows";

const Xarrow = dynamic(() => import("react-xarrows"), { ssr: false });

function Eventpoint({ parameter }) {
  const updateXarrow = useXarrow();

  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setWidth(ref.current.clientWidth);
  });
  useEffect(() => {
    updateXarrow();
  }, [parameter]);

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
      ? previousMonday(parameter.create_date)
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
  const startPoint = differenceInDays(parameter.create_date, timelineStart);
  const billingPoint =
    parameter.billing_cycle_anchor === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.billing_cycle_anchor, timelineStart)
      : differenceInMonths(parameter.billing_cycle_anchor, timelineStart) * 30 +
        differenceInDays(
          parameter.billing_cycle_anchor,
          addMonths(
            timelineStart,
            differenceInMonths(parameter.billing_cycle_anchor, timelineStart)
          )
        );
  const trialEndPoint =
    parameter.trial_end === null
      ? 0
      : parameter.interval === "day"
      ? differenceInCalendarDays(parameter.trial_end, timelineStart)
      : differenceInMonths(parameter.trial_end, timelineStart) * 30 +
        differenceInDays(
          parameter.trial_end,
          addMonths(
            timelineStart,
            differenceInMonths(parameter.trial_end, timelineStart)
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

  const width1 = (width - 16) * (startPoint / timeline);
  const width2 =
    (width - 16) * (trialEndPoint / timeline) - 96 - width1 > 0
      ? (width - 16) * (trialEndPoint / timeline) - 96 - width1
      : 0;
  const width3 =
    (width - 16) * (billingPoint / timeline) -
      96 -
      96 * (trialEndPoint === 0 ? 0 : 1) -
      width1 -
      width2 >
    0
      ? (width - 16) * (billingPoint / timeline) -
        96 -
        96 * (trialEndPoint === 0 ? 0 : 1) -
        width1 -
        width2
      : 0;
  const width4 =
    (width - 16) * (updatePoint / timeline) -
    96 -
    96 * (trialEndPoint === 0 ? 0 : 1) -
    96 * (billingPoint === 0 ? 0 : 1) -
    width1 -
    width2 -
    width3;

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  // console.log("width:" + width);
  // console.log("width1:" + width1);
  // console.log("width2:" + width2);
  // console.log("width3:" + width3);
  // console.log("width4:" + width4);
  // console.log("endDate:" + endDate);
  // console.log("updateDate:" + updateDate);
  // console.log("timeline:" + timeline);
  // console.log("startPoint:" + startPoint);
  // console.log("trialEndPoint:" + trialEndPoint);
  // console.log("billingPoint:" + billingPoint);
  // console.log("updatePoint:" + updatePoint);
  return (
    <div className=" bottom-5">
      {/* create the event description */}
      <div className="pt-10 mx-[10px] relative">
        <div
          className="static inline-block h-2"
          style={{ width: width1 + "px" }}
        />
        <span
          id="d-create-date"
          class=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
        >
          {parameter.billing_cycle_anchor !== null &&
          parameter.trial_end === null &&
          parameter.proration_behavior === "create_prorations"
            ? "Creation  Charge"
            : "Creation"}
        </span>
        {parameter.trial_end === null ? null : (
          <div className=" inline-block">
            <div
              className="static inline-block"
              style={{
                width: width2 + "px",
              }}
            />
            <span
              id="d-trial_end"
              class=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
            >
              Trial End Charge
            </span>
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div className=" inline-block">
            <div
              className="static inline-block"
              style={{
                width: width3 + "px",
              }}
            />
            <span
              id="d-billing-date"
              class=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
            >
              Charge
            </span>
          </div>
        )}
        <div
          className="static inline-block"
          style={{
            width: width4 + "px",
          }}
        />
        <span
          id="d-update-point"
          class=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center "
        >
          Update Charge
        </span>
      </div>

      {/* Create the date point */}
      <div ref={ref} className="h-5 mx-12 relative z-20">
        <div
          id="p-create_date"
          className={classNames(
            "w-5 h-5 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-3 "
          )}
          style={{ left: (width - 20) * (startPoint / timeline) + "px" }}
        />
        <Xarrow
          startAnchor={"bottom"}
          endAnchor={"top"}
          path="straight"
          color="#0A2540"
          headSize={4}
          start="d-create-date" //can be react ref
          end="p-create_date" //or an id
          strokeWidth={2}
        />
        {parameter.trial_end === null ? null : (
          <div>
            <div
              id="p-trial_end"
              className={classNames(
                "w-5 h-5 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-3 "
              )}
              style={{
                left: (width - 20) * (trialEndPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              path="straight"
              color="#0A2540"
              headSize={4}
              start="d-trial_end" //can be react ref
              end="p-trial_end" //or an id
              strokeWidth={"2"}
            />
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div>
            <div
              id="p-billing-date"
              className={classNames(
                "w-5 h-5 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-3 "
              )}
              style={{
                left: (width - 20) * (billingPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              path="straight"
              color="#0A2540"
              headSize={4}
              start="d-billing-date" //can be react ref
              end="p-billing-date" //or an id
              strokeWidth={"2"}
            />
          </div>
        )}
        <div>
          <div
            id="p-update-point"
            className={classNames(
              "w-5 h-5 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-3 "
            )}
            style={{
              left: (width - 20) * (updatePoint / timeline) + "px",
            }}
          />
          <Xarrow
            startAnchor={"bottom"}
            endAnchor={"top"}
            path="straight"
            color="#0A2540"
            headSize={4}
            start="d-update-point" //can be react ref
            end="p-update-point" //or an id
            strokeWidth={"2"}
          />
        </div>
      </div>
    </div>
  );
}

export default Eventpoint;
