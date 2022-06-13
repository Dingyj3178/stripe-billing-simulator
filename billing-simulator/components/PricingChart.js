import React from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { Line } from "react-chartjs-2";

function PricingChart({ pricingData }) {
  const mode = pricingData.tiers_mode;
  let labels = [];
  let dataSets = [];
  if (mode === "volume") {
    pricingData.pricingTiers.forEach((element, index) => {
      let up_to =
        element.up_to === "inf"
          ? pricingData.pricingTiers[index - 1].up_to +
            pricingData.pricingTiers[index - 1].up_to
          : element.up_to;
      let i = index === 0 ? 0 : pricingData.pricingTiers[index - 1].up_to + 1;
      for (i; i <= up_to; i++) {
        labels.push(i);
        dataSets.push(element.unit_amount * i + element.flat_amount);
      }
    });
  } else if (mode === "graduated") {
    function calculatePreviousPrice(i) {
      if (i === 0) {
        return (
          pricingData.pricingTiers[0].up_to *
            pricingData.pricingTiers[0].unit_amount +
          pricingData.pricingTiers[0].flat_amount
        );
      } else {
        return (
          calculatePreviousPrice(i - 1) +
          (pricingData.pricingTiers[i].up_to -
            pricingData.pricingTiers[i - 1].up_to) *
            pricingData.pricingTiers[i].unit_amount +
          pricingData.pricingTiers[i].flat_amount
        );
      }
    }
    pricingData.pricingTiers.forEach((element, index) => {
      let up_to =
        element.up_to === "inf"
          ? pricingData.pricingTiers[index - 1].up_to +
            pricingData.pricingTiers[index - 1].up_to
          : element.up_to;
      let i = index === 0 ? 0 : pricingData.pricingTiers[index - 1].up_to + 1;
      const previousPhasePrice =
        index === 0 ? 0 : calculatePreviousPrice(index - 1);
      const previousPhaseUpto =
        index === 0 ? 0 : pricingData.pricingTiers[index - 1].up_to;
      for (i; i <= up_to; i++) {
        labels.push(i);
        dataSets.push(
          element.unit_amount * (i - previousPhaseUpto) +
            previousPhasePrice +
            element.flat_amount
        );
      }
    });
  } else {
    for (let i = 0; i < 5; i++) {
      labels.push(i * 5);
      dataSets.push(pricingData.unit_amount * i * 5);
    }
  }

  return (
    <Line
      data={{
        labels: labels,
        datasets: [
          {
            label: "Price",
            data: dataSets,
            borderColor: "rgb(122, 115, 255)",
            backgroundColor: "rgb(122, 115, 255)",
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
      }}
    />
  );
}

export default PricingChart;
