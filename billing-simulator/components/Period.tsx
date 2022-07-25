import React, { useState, useEffect, useRef } from "react";
import differenceInDays from "date-fns/differenceInDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInMonths from "date-fns/differenceInMonths";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import previousMonday from "date-fns/previousMonday";
import addMonths from "date-fns/addMonths";
import addDays from "date-fns/addDays";
import getDate from "date-fns/getDate";
import dynamic from "next/dynamic";
import { useXarrow } from "react-xarrows";

import { eventPointCalculator, widthCalculator } from "../utils/timelineHelper";

import { Parameters } from "../typings";

// import Xarrow from "react-xarrows";

const Xarrow = dynamic(() => import("react-xarrows"), { ssr: false });

function Period({ parameter }: { parameter: Parameters }) {
  const updateXarrow = useXarrow();

  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setWidth(ref.current!.clientWidth);
  });
  useEffect(() => {
    updateXarrow();
  }, [parameter]);

  const result = eventPointCalculator(parameter);
  const timeline = result.timeline;
  const startPoint = result.startPoint;
  const updatePoint = result.updatePoint;
  const trialEndPoint = result.trialEndPoint;
  const billingPoint = result.billingPoint;

  function classNames(...classes: any) {
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
              // path="straight"
              color="#0A2540"
              headSize={4}
              tailSize={4}
              start="line-create_date" //can be react ref
              end="line-trial_end" //or an id
              strokeWidth={2}
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
                // path="straight"
                color="#0A2540"
                headSize={4}
                tailSize={4}
                start={
                  parameter.trial_end === null
                    ? "line-create_date"
                    : "line-trial_end"
                } //can be react ref
                end="line-billing-date" //or an id
                strokeWidth={2}
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
            // path="straight"
            color="#0A2540"
            headSize={4}
            tailSize={4}
            start={
              parameter.billing_cycle_anchor === null
                ? parameter.trial_end === null
                  ? "line-create_date"
                  : "line-trial_end"
                : "line-billing-date"
            }
            end="line-update-point"
            strokeWidth={2}
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
