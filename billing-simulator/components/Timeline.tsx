import React, { useRef, useEffect, useState } from "react";
import eachMonthOfInterval from "date-fns/eachMonthOfInterval";
import eachYearOfInterval from "date-fns/eachYearOfInterval";
import eachWeekOfInterval from "date-fns/eachWeekOfInterval";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import { Parameters } from "../typings";

function Timeline({ parameter }: { parameter: Parameters }) {
  const ref = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);
  // const timelineWidth = 854;
  useEffect(() => {
    setTimelineWidth(ref.current!.clientWidth);
  });
  let timelineArray: Date[] = [];
  const timelineStart = new Date(
    parameter.create_date!.getFullYear(),
    parameter.create_date!.getMonth(),
    1
  );
  let endDate =
    parameter.billing_cycle_anchor !== null
      ? parameter.billing_cycle_anchor
      : parameter.trial_end !== null
      ? parameter.trial_end
      : parameter.create_date;

  switch (parameter.interval) {
    case "month":
      //   setTimelineLength(12);
      timelineArray = eachMonthOfInterval({
        start: timelineStart,
        end: new Date(
          endDate!.getFullYear(),
          endDate!.getMonth() + parameter.interval_count * 2 + 2,
          1
        ),
      });
      break;
    case "year":
      timelineArray = eachYearOfInterval({
        start: timelineStart,
        end: new Date(
          endDate!.getFullYear() + parameter.interval_count * 2 + 1,
          endDate!.getMonth(),
          1
        ),
      });
      break;
    case "week":
      timelineArray = eachWeekOfInterval({
        start: parameter.create_date!,
        end: new Date(endDate!).setDate(
          endDate!.getDate() + parameter.interval_count * 14 + 14
        ),
      });
      break;
    case "day":
      timelineArray = eachDayOfInterval({
        start: parameter.create_date!,
        end: new Date(endDate!).setDate(
          endDate!.getDate() + parameter.interval_count * 2 + 1
        ),
      });
      break;
    default:
      12;
  }
  const displayDensity = Math.ceil((timelineArray.length * 80) / timelineWidth);
  let displayIndex: number[] = [];
  for (let index = 0; index < timelineArray.length; index += displayDensity) {
    displayIndex.push(index);
  }

  return (
    <div ref={ref} className="flex justify-between -mt-2 mb-10 mx-12 ">
      {/* <div className="flex justify-between -mt-2 mb-10 mx-12 "> */}
      {timelineArray.map((id, index) => {
        return (
          <div
            key={id.toString()}
            className=" w-3 h-3  bg-yellow-500 rounded-full relative"
          >
            {displayIndex.includes(index) ? (
              <div className=" absolute -translate-x-1/3 left-1/3 top-8 w-20 text-center z-10">
                {id.getFullYear() +
                  "/" +
                  (id.getMonth() + 1) +
                  "/" +
                  id.getDate()}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
