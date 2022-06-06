import React, { useState, useEffect, useRef } from "react";

import dynamic from "next/dynamic";
import { useXarrow } from "react-xarrows";

import { eventPointCalculator, widthCalculator } from "../utils/timelineHelper";

const Xarrow = dynamic(() => import("react-xarrows"), { ssr: false });

function Eventpoint({ parameter }) {
  const updateXarrow = useXarrow();

  const [timelineWidth, setTimelineWidth] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    setTimelineWidth(ref.current.clientWidth);
  });
  useEffect(() => {
    updateXarrow();
  }, [parameter]);

  const result = eventPointCalculator(parameter);
  const widthResult = widthCalculator(result, timelineWidth);
  const timeline = result.timeline;
  const startPoint = result.startPoint;
  const updatePoint = result.updatePoint;
  const trialEndPoint = result.trialEndPoint;
  const billingPoint = result.billingPoint;
  const width1 = widthResult.width1;
  const width2 = widthResult.width2;
  const width3 = widthResult.width3;
  const width4 = widthResult.width4;

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  // console.log("width:" + timelineWidth);
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
      <div className="pt-10 mx-0 relative">
        <div
          className="static inline-block h-2"
          style={{ width: width1 + "px" }}
        />
        <span
          id="d-create-date"
          className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
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
              className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
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
              className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center"
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
          className=" inline-block px-3 py-0.5 rounded-full text-sm font-medium text-gray-50 bg-violet-500 mb-20 break-words w-24 text-center "
        >
          Charge for Update
        </span>
      </div>

      {/* Create the date point */}
      <div ref={ref} className="h-5 mx-12 relative z-20">
        <div
          id="p-create_date"
          className={classNames(
            "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2  rounded-full absolute -bottom-2 "
          )}
          style={{ left: (timelineWidth - 6) * (startPoint / timeline) + "px" }}
        />
        <Xarrow
          startAnchor={"bottom"}
          endAnchor={"top"}
          color={"#0A2540"}
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
                "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
              )}
              style={{
                left: (timelineWidth - 6) * (trialEndPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              color="#0A2540"
              headSize={4}
              start="d-trial_end" //can be react ref
              end="p-trial_end" //or an id
              strokeWidth={2}
            />
          </div>
        )}
        {parameter.billing_cycle_anchor === null ? null : (
          <div>
            <div
              id="p-billing-date"
              className={classNames(
                "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
              )}
              style={{
                left: (timelineWidth - 6) * (billingPoint / timeline) + "px",
              }}
            />
            <Xarrow
              startAnchor={"bottom"}
              endAnchor={"top"}
              color="#0A2540"
              headSize={4}
              start="d-billing-date" //can be react ref
              end="p-billing-date" //or an id
              strokeWidth={2}
            />
          </div>
        )}
        <div>
          <div
            id="p-update-point"
            className={classNames(
              "w-3 h-3 bg-[#80E9FF] border-[#7A73FF] border-2 rounded-full absolute -bottom-2 "
            )}
            style={{
              left: (timelineWidth - 6) * (updatePoint / timeline) + "px",
            }}
          />
          <Xarrow
            startAnchor={"bottom"}
            endAnchor={"top"}
            color="#0A2540"
            headSize={4}
            start="d-update-point" //can be react ref
            end="p-update-point" //or an id
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
}

export default Eventpoint;
