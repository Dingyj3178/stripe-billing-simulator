import * as Yup from "yup";
import { calculateUpdate } from "../utils/timelineHelper";

function arrayUptoValidate(array) {
  let length = array.length - 1;
  array.pop();
  return array.every((value, index) => {
    let nextIndex = index + 1;
    if (nextIndex < length) {
      return value.up_to * 1 < array[nextIndex].up_to * 1;
    } else {
      return true;
    }
  });
}

function SimulatorValidationSchema() {
  return Yup.object({
    create_date: Yup.string().required("Required").nullable(),
    billing_cycle_anchor: Yup.string()
      .nullable()
      .test({
        name: "billing_cycle_anchor",
        exclusive: false,
        params: {},
        message: "billing_cycle_anchor must be greater than trial_end",
        test: function (value) {
          // You can access the price field with `this.parent`.
          if (this.parent.trial_end !== null && value !== null) {
            return new Date(value) > new Date(this.parent.trial_end);
          } else return true;
        },
      })
      .test({
        name: "billing_cycle_anchor",
        exclusive: false,
        params: {},
        message: `billing_cycle_anchor cannot be later than next natural billing date for plan`,
        test: function (value) {
          // You can access the price field with `this.parent`.
          if (value !== null) {
            return (
              new Date(value) <=
              calculateUpdate(
                this.parent.trial_end,
                this.parent.create_date,
                this.parent.interval,
                this.parent.interval_count
              )
            );
          } else return true;
        },
      }),
    trial_end: Yup.string()
      .nullable()
      .test({
        name: "trial_end",
        exclusive: false,
        params: {},
        message: "trial_end must be greater than create_date",
        test: function (value) {
          if (value !== null) {
            return new Date(value) > new Date(this.parent.create_date);
          } else return true;
        },
      }),
    proration_behavior: Yup.string()
      .oneOf(["none", "create_prorations"])
      .test({
        name: "proration_behavior",
        exclusive: false,
        params: {},
        message:
          "When billing_cycle_anchor follows a trial, the anchored invoice must be prorated. For a longer free period, use a longer trial.",
        test: function (value) {
          if (
            this.parent.trial_end !== null &&
            this.parent.billing_cycle_anchor !== null
          ) {
            return value === "create_prorations";
          } else return true;
        },
      }),
    interval: Yup.string()
      .oneOf(["month", "year", "week", "day"])
      .required("Required"),
    currency: Yup.string()
      .oneOf(["usd", "aud", "jpy", "cny", "nzd", "eur", "sgd"])
      .required("Required"),
    unit_amount: Yup.number()
      .required("Required")
      .test({
        name: "unit_amount",
        exclusive: false,
        params: {},
        message:
          "The amount is lower then the minimum amount for this currency",
        test: function (value) {
          if (this.parent.currency === "usd") {
            return value >= 50;
          } else if (this.parent.currency === "jpy") {
            return value >= 50;
          } else if (this.parent.currency === "sgd") {
            return value >= 50;
          } else if (this.parent.currency === "eur") {
            return value >= 50;
          } else if (this.parent.currency === "nzd") {
            return value >= 50;
          } else if (this.parent.currency === "aud") {
            return value >= 50;
          } else return true;
        },
      }),
    interval_count: Yup.number()
      .required("Required")
      .when("interval", {
        is: "month",
        then: (schema) => schema.max(11),
      })
      .when("interval", {
        is: "year",
        then: (schema) => schema.max(4),
      })
      .when("interval", {
        is: "week",
        then: (schema) => schema.max(3),
      })
      .when("interval", {
        is: "day",
        then: (schema) => schema.max(6),
      }),
    usage_type: Yup.string().oneOf(["licensed", "metered"]),
    tiers_mode: Yup.string().oneOf(["volume", "graduated", ""]),
    pricingTiers: Yup.array()
      .of(
        Yup.object().shape({
          up_to: Yup.string()
            .required("Required")
            .test({
              name: "up_to",
              exclusive: false,
              params: {},
              message: "up_to must greater than 0",
              test: function (value) {
                if (value !== "inf") {
                  return value * 1 > 0;
                } else return true;
              },
            })
            .test({
              name: "up_to",
              exclusive: false,
              params: {},
              message: "keep up_to less then 100 for better experience",
              test: function (value) {
                if (value !== "inf") {
                  return value * 1 <= 100;
                } else return true;
              },
            }),
          unit_amount: Yup.number()
            .required("Required")
            .test({
              name: "unit_amount",
              exclusive: false,
              params: {},
              message: "unit_amount must greater than 50",
              test: function (value) {
                if (value !== 0) {
                  return value >= 50;
                } else return true;
              },
            }),
          flat_amount: Yup.number()
            // .min(50, "flat_amount must greater than 50 ")
            .required("Required")
            .test({
              name: "flat_amount",
              exclusive: false,
              params: {},
              message: "flat_amount must greater than 50",
              test: function (value) {
                if (value !== 0) {
                  return value >= 50;
                } else return true;
              },
            }),
        })
      )
      .min(2, "You must set at least 2 pricingTiers")
      .test({
        name: "pricingTiers",
        message: "each tier's up_to must greater then previous tier ",
        test: function (value) {
          return arrayUptoValidate(value);
        },
      }),
  });
}

export default SimulatorValidationSchema;
