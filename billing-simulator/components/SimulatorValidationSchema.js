import * as Yup from "yup";
import { calculateUpdate } from "../utils/timelineHelper";

function SimulatorValidationSchema(parameter) {
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
        message: `billing_cycle_anchor cannot be later than next natural billing date ${calculateUpdate(
          parameter
        )} for plan`,
        test: function (value) {
          // You can access the price field with `this.parent`.
          if (value !== null) {
            return new Date(value) <= calculateUpdate(parameter);
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
            .min(1, "up_to must greater than 50 "),
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
      .min(2, "You must set at least 2 pricingTiers"),
  });
}

export default SimulatorValidationSchema;
