import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { Bar } from "react-chartjs-2";

import addYears from "date-fns/addYears";
import addMonths from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addDays from "date-fns/addDays";

import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import isLeapYear from "date-fns/isLeapYear";
import getDaysInMonth from "date-fns/getDaysInMonth";

import { calculateUpdate, formatDate } from "../utils/timelineHelper";

import { Parameters } from "../typings";

function calculatePrice(
  i: number,
  parameter: Parameters,
  usage?: number
): number {
  if (parameter.tiers_mode === "volume" && usage) {
    let price: number = 0;
    for (let index = 0; index < parameter.pricingTiers.length; index++) {
      const element = parameter.pricingTiers[index];
      if (i > 0) {
        if (
          index === parameter.pricingTiers.length - 1 ||
          usage === element.up_to
        ) {
          price = element.unit_amount * i + element.flat_amount;
          break;
        } else if (
          usage > element.up_to &&
          usage <= parameter.pricingTiers[index + 1].up_to
        ) {
          price =
            parameter.pricingTiers[index + 1].unit_amount * i +
            parameter.pricingTiers[index + 1].flat_amount;
          break;
        }
      }
    }
    return price;
  } else if (parameter.tiers_mode === "graduated") {
    let price: number = 0;
    let counter: number = i;
    for (let index = parameter.pricingTiers.length - 1; index >= 0; index--) {
      const element = parameter.pricingTiers[index];
      if (
        element.up_to === "inf" &&
        counter > parameter.pricingTiers[index - 1].up_to
      ) {
        price =
          price +
          (counter - (parameter.pricingTiers[index - 1].up_to as number)) *
            parameter.pricingTiers[index].unit_amount +
          parameter.pricingTiers[index].flat_amount;

        counter = parameter.pricingTiers[index - 1].up_to as number;
      } else if (
        counter > (element.up_to === "inf" ? 9999999 : element.up_to)
      ) {
        price =
          price +
          (counter - (element.up_to as number)) *
            parameter.pricingTiers[index + 1].unit_amount +
          parameter.pricingTiers[index + 1].flat_amount;

        counter = element.up_to as number;
      } else if (counter === element.up_to) {
        if (index >= 1) {
          price =
            price +
            (counter - (parameter.pricingTiers[index - 1].up_to as number)) *
              parameter.pricingTiers[index].unit_amount +
            parameter.pricingTiers[index].flat_amount;

          counter = parameter.pricingTiers[index - 1].up_to as number;
        } else {
          price =
            price +
            (parameter.pricingTiers[index].up_to as number) *
              parameter.pricingTiers[index].unit_amount +
            parameter.pricingTiers[index].flat_amount;
          counter = 0;
        }
      } else if (
        index >= 1 &&
        counter < element.up_to &&
        counter > (parameter.pricingTiers[index - 1].up_to as number)
      ) {
        price =
          price +
          (counter - (parameter.pricingTiers[index - 1].up_to as number)) *
            parameter.pricingTiers[index].unit_amount +
          parameter.pricingTiers[index].flat_amount;

        counter = parameter.pricingTiers[index - 1].up_to as number;
      } else if (index === 0 && counter < element.up_to && counter !== 0) {
        price =
          price +
          counter * parameter.pricingTiers[index].unit_amount +
          parameter.pricingTiers[index].flat_amount;
      }
    }
    return price;
  } else {
    return i * parameter.unit_amount;
  }
}

function MeteredChart({ parameter }: { parameter: Parameters }) {
  let labels: number[] = [];
  let dataSetsMap = new Map<string, number[]>();
  const barColorSets: string[] = [
    "rgb(245, 243, 255)",
    "rgb(237, 233, 254)",
    "rgb(221, 214, 254)",
    "rgb(196, 181, 253)",
    "rgb(167, 139, 250)",
    "rgb(139, 92, 246)",
    "rgb(124, 58, 237)",
    "rgb(109, 40, 217)",
    "rgb(91, 33, 182)",
    "rgb(76, 29, 149)",
  ];

  if (parameter.billing_cycle_anchor) {
    labels.push(Math.floor(parameter.billing_cycle_anchor.getTime() / 1000));
  }

  labels.push(
    Math.floor(
      calculateUpdate(
        parameter.billing_cycle_anchor as Date,
        parameter.trial_end as Date,
        parameter.create_date as Date,
        parameter.interval,
        parameter.interval_count
      ).getTime() / 1000
    )
  );

  // add the usage record date to the label if it greater than greatest date
  for (let index = 0; index < parameter.usageRecord.length; index++) {
    const element = parameter.usageRecord[index];
    const usageDate = Math.floor(Number(element.timestamp) / 1000);
    const greatestUpdateDate = labels[labels.length - 1];
    const differenceFromUsageDate = (usageDate as number) - greatestUpdateDate;

    if (usageDate > greatestUpdateDate) {
      const updateDate =
        parameter.interval === "year"
          ? addYears(
              new Date((greatestUpdateDate as number) * 1000),
              parameter.interval_count *
                (Math.abs(differenceFromUsageDate) / 86400) >=
                differenceInCalendarDays(
                  new Date((usageDate as number) * 1000),
                  new Date((greatestUpdateDate as number) * 1000)
                )
                ? Math.ceil(
                    Math.abs(differenceFromUsageDate) /
                      86400 /
                      (isLeapYear(new Date((usageDate as number) * 1000)) ||
                      isLeapYear(
                        new Date((greatestUpdateDate as number) * 1000)
                      )
                        ? 366
                        : 365)
                  )
                : differenceInCalendarYears(
                    new Date((usageDate as number) * 1000),
                    new Date((greatestUpdateDate as number) * 1000)
                  )
            )
          : parameter.interval === "month"
          ? addMonths(
              new Date((greatestUpdateDate as number) * 1000),
              parameter.interval_count *
                (Math.abs(differenceFromUsageDate) / 86400) >=
                differenceInCalendarDays(
                  new Date((usageDate as number) * 1000),
                  new Date((greatestUpdateDate as number) * 1000)
                )
                ? Math.ceil(
                    Math.abs(differenceFromUsageDate) /
                      86400 /
                      getDaysInMonth(new Date(greatestUpdateDate * 1000))
                  )
                : differenceInCalendarMonths(
                    new Date((usageDate as number) * 1000),
                    new Date((greatestUpdateDate as number) * 1000)
                  )
            )
          : parameter.interval === "week"
          ? addWeeks(
              new Date((greatestUpdateDate as number) * 1000),
              parameter.interval_count *
                (Math.abs(differenceFromUsageDate) / 86400) >=
                differenceInCalendarDays(
                  new Date((usageDate as number) * 1000),
                  new Date((greatestUpdateDate as number) * 1000)
                )
                ? Math.ceil(Math.abs(differenceFromUsageDate) / 86400 / 7)
                : differenceInCalendarWeeks(
                    new Date((usageDate as number) * 1000),
                    new Date((greatestUpdateDate as number) * 1000)
                  )
            )
          : addDays(
              new Date((greatestUpdateDate as number) * 1000),
              parameter.interval_count *
                (Math.abs(differenceFromUsageDate) / 86400) >=
                differenceInCalendarDays(
                  new Date((usageDate as number) * 1000),
                  new Date((greatestUpdateDate as number) * 1000)
                )
                ? Math.ceil(Math.abs(differenceFromUsageDate) / 86400)
                : differenceInCalendarDays(
                    new Date((usageDate as number) * 1000),
                    new Date((greatestUpdateDate as number) * 1000)
                  )
            );
      labels.push(Math.floor(updateDate.getTime() / 1000));
    }
  }

  // add the quantity for each usage record to the label array
  for (let index = 0; index < parameter.usageRecord.length; index++) {
    const element = parameter.usageRecord[index];
    const usageDate = Math.floor(Number(element.timestamp) / 1000);
    if (index > 0) {
      const lastElement = parameter.usageRecord[index - 1];
      const lastUsageDate = Math.floor(Number(lastElement.timestamp) / 1000);
      if (usageDate === lastUsageDate && element.action !== "set") {
        const lastValue: number[] = dataSetsMap.get(
          formatDate(new Date((usageDate as number) * 1000), true)
        )!;

        dataSetsMap.set(
          formatDate(new Date((usageDate as number) * 1000), true),
          labels.map((i, index, array) => {
            if (index === 0) {
              return usageDate <= array[index]
                ? element.quantity + lastValue[index]
                : 0;
            } else {
              return usageDate <= array[index] && usageDate > array[index - 1]
                ? element.quantity + lastValue[index]
                : 0;
            }
          }) as number[]
        );
      } else {
        dataSetsMap.set(
          formatDate(new Date((usageDate as number) * 1000), true),
          labels.map((i, index, array) => {
            if (index === 0) {
              return usageDate <= array[index] ? element.quantity : 0;
            } else {
              return usageDate <= array[index] && usageDate > array[index - 1]
                ? element.quantity
                : 0;
            }
          }) as number[]
        );
      }
    } else {
      dataSetsMap.set(
        formatDate(new Date((usageDate as number) * 1000), true),
        labels.map((i, index, array) => {
          if (index === 0) {
            return usageDate <= array[index] ? element.quantity : 0;
          } else {
            return usageDate <= array[index] && usageDate > array[index - 1]
              ? element.quantity
              : 0;
          }
        }) as number[]
      );
    }
  }

  const keys = Array.from(dataSetsMap.keys());
  let usageSum: number[] = labels.map((i) => 0); // set 0 for each label position

  for (let index = 0; index < keys.length; index++) {
    const usageOnDate = dataSetsMap.get(keys[index]);
    usageSum = usageSum.map(function (num, idx) {
      return num + usageOnDate![idx];
    });
  }

  const chartDataMap =
    parameter.tiers_mode === "graduated"
      ? [
          {
            data: usageSum.map((num) => {
              return calculatePrice(num, parameter, undefined);
            }),
            backgroundColor: barColorSets[3],
            maxBarThickness: 20,
          },
        ]
      : keys.map((chargeDate, index) => ({
          label: chargeDate,
          data: dataSetsMap.get(chargeDate)?.map((num, index) => {
            return calculatePrice(num, parameter, usageSum[index]);
          }) as number[],
          backgroundColor: barColorSets[index],
          maxBarThickness: 20,
        }));

  return (
    <Bar
      data={{
        labels: labels.map((i) => formatDate(new Date(i * 1000), false)),
        datasets: chartDataMap,
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      }}
    />
  );
}

export default MeteredChart;
