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

function Period({ parameter }) {
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

  switch (parameter.interval) {
    case "month":
      //   setTimelineLength(12);
      // console.log(
      //   differenceInCalendarMonths(
      //     new Date(
      //       endDate.getFullYear(),
      //       endDate.getMonth() + (parameter.interval_count * 1 + 1),
      //       1
      //     ),
      //     endDate
      //   ) * 30
      // );
      // console.log(differenceInCalendarMonths(endDate, timelineStart) * 30);
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

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  // console.log("width:" + width);

  // console.log("endDate:" + endDate);
  // console.log("updateDate:" + updateDate);
  // console.log("timeline:" + timeline);
  // console.log("startPoint:" + startPoint);
  // console.log("trialEndPoint:" + trialEndPoint);
  // console.log("billingPoint:" + billingPoint);
  // console.log("updatePoint:" + updatePoint);
  return (
    <div>
      {/* Create the date point */}
      <div ref={ref} className="h-24 mx-12 relative ">
        <div
          className={classNames(
            "w-3 h-3 rounded-full absolute place-items-center grid "
          )}
          style={{ left: (width - 6) * (startPoint / timeline) + "px" }}
        >
          {parameter.proration_behavior === "none" &&
          parameter.billing_cycle_anchor !== null ? null : (
            <div id="line-create_date" className=" w-1 h-12 bg-[#0A2540]" />
          )}
        </div>
        {parameter.trial_end === null ? null : (
          <div
            className={classNames(
              "w-3 h-3  rounded-full absolute place-items-center grid"
            )}
            style={{
              left: (width - 6) * (trialEndPoint / timeline) + "px",
            }}
          >
            <div id="line-trial_end" className=" w-1 h-12 bg-[#0A2540] " />
            <Xarrow
              startAnchor={"right"}
              endAnchor={"left"}
              path="straight"
              color="#0A2540"
              headSize="4"
              tailSize="4"
              start="line-create_date" //can be react ref
              end="line-trial_end" //or an id
              strokeWidth={"2"}
              dashness
              showTail
              labels={<div className=" mt-20">Trial</div>}
              tailShape="arrow1"
              headShape="arrow1"
            />
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div>
            <div
              className={classNames(
                "w-3 h-3 rounded-full absolute place-items-center grid "
              )}
              style={{
                left: (width - 6) * (billingPoint / timeline) + "px",
              }}
            >
              <div id="line-billing-date" className=" w-1 h-12 bg-[#0A2540]" />
            </div>
            {parameter.proration_behavior === "create_prorations" ? (
              <Xarrow
                startAnchor={"right"}
                endAnchor={"left"}
                path="straight"
                color="#0A2540"
                headSize="4"
                tailSize="4"
                start={
                  parameter.trial_end === null
                    ? "line-create_date"
                    : "line-trial_end"
                } //can be react ref
                end="line-billing-date" //or an id
                strokeWidth={"2"}
                dashness
                showTail
                labels={<div className=" mt-20 ">Proration</div>}
                tailShape="arrow1"
                headShape="arrow1"
              />
            ) : null}
          </div>
        )}
        <div>
          <div
            className={classNames(
              "w-3 h-3  rounded-full absolute place-items-center grid"
            )}
            style={{
              left: (width - 6) * (updatePoint / timeline) + "px",
            }}
          >
            <div id="line-update-point" className=" w-1 h-12 bg-[#0A2540]" />
          </div>
          <Xarrow
            startAnchor={"right"}
            endAnchor={"left"}
            path="straight"
            color="#0A2540"
            headSize="4"
            tailSize="4"
            start={
              parameter.billing_cycle_anchor === null
                ? parameter.trial_end === null
                  ? "line-create_date"
                  : "line-trial_end"
                : "line-billing-date"
            }
            end="line-update-point"
            strokeWidth={"2"}
            dashness
            showTail
            labels={<div className=" mt-20">Biling Cycle</div>}
            tailShape="arrow1"
            headShape="arrow1"
          />
        </div>
      </div>
    </div>
  );
}

export default Period;
