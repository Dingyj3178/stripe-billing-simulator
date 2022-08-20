import Head from "next/head";
import React, { useRef, useState, Fragment, useEffect } from "react";
import { useTimeoutFn } from "react-use";
import { Transition } from "@headlessui/react";
import { DownloadIcon, ClipboardCopyIcon } from "@heroicons/react/solid";

import { Formik, Form, useFormikContext } from "formik";
import SimulatorValidationSchema from "../components/SimulatorValidationSchema";

import * as htmlToImage from "html-to-image";
import downloadjs from "downloadjs";

import * as gtag from "../utils/gtag";
import { postmanExport } from "../utils/postmanExport";

import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";

import queryString from "query-string";

import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import Navbar from "../components/Navbar";
import Timeline from "../components/Timeline";
import InputLabel from "../components/InputLabel";
import PricingChart from "../components/PricingChart";
import MeteredChart from "../components/MeteredChart";
import TiersTable from "../components/TiersTable";
import MetersTable from "../components/MetersTable";
// import Eventpoint from "../components/Eventpoint";
// import Period from "../components/Period";

import { Parameters } from "../typings";

const Eventpoint = dynamic(() => import("../components/Eventpoint"), {
  ssr: false,
});
const Period = dynamic(() => import("../components/Period"), {
  ssr: false,
});

const Submission = () => {
  const { submitForm } = useFormikContext();
  useEffect(() => {
    // Submit the form imperatively as an effect as soon as form values.token are 6 digits long
    submitForm();
  }, []);
  return null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryValue = queryString.parse(context.resolvedUrl.slice(2), {
    arrayFormat: "index",
  });
  return {
    props: { queryValue },
  };
};

export default function Home({ queryValue }: { queryValue: any }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const initValues: Parameters = {
    create_date: queryValue.create_date
      ? new Date(queryValue.create_date * 1000)
      : setHours(setMinutes(setSeconds(new Date(), 0), 0), 0),
    interval: queryValue.interval ? queryValue.interval : "month",
    interval_count: queryValue.interval_count ? queryValue.interval_count : 1,
    billing_cycle_anchor:
      queryValue.billing_cycle_anchor &&
      queryValue.billing_cycle_anchor !== "" &&
      queryValue.billing_cycle_anchor !== "0"
        ? new Date(queryValue.billing_cycle_anchor * 1000)
        : null,
    trial_end:
      queryValue.trial_end &&
      queryValue.trial_end !== "" &&
      queryValue.trial_end !== "0"
        ? new Date(queryValue.trial_end * 1000)
        : null,
    proration_behavior: queryValue.proration_behavior
      ? queryValue.proration_behavior
      : "none",
    unit_amount: queryValue.unit_amount ? queryValue.unit_amount : 1000,
    currency: queryValue.currency ? queryValue.currency : "usd",
    usage_type: queryValue.usage_type ? queryValue.usage_type : "licensed",
    tiers_mode: queryValue.tiers_mode ? queryValue.tiers_mode : "",
    aggregate_usage: queryValue.aggregate_usage
      ? queryValue.aggregate_usage
      : "sum",
    pricingTiers: queryValue.pricingTiers
      ? queryValue.pricingTiers.map((i: any) => JSON.parse(i))
      : [
          { up_to: 1, unit_amount: 1000, flat_amount: 0 },
          { up_to: "inf", unit_amount: 1000, flat_amount: 0 },
        ],
    usageRecord: queryValue.usageRecord
      ? queryValue.usageRecord
          .map((i: any) => JSON.parse(i))
          .map((i: any) => ({
            quantity: i.quantity,
            action: i.action,
            timestamp: new Date(i.timestamp * 1000),
          }))
      : [
          {
            quantity: 1,
            action: "increment",
            timestamp: setHours(setMinutes(setSeconds(new Date(), 0), 0), 0),
          },
        ],
  };

  // const router = useRouter();
  // const { intial_create_date, intial_interval_count } = router.query;

  let [isShowing, setIsShowing] = useState(false);
  // const [pricingTiers, setPricingTiers] = useState([
  //   { id: 1, up_to: 1, unit_amount: 1000, flat_amount: 0 },
  // ]);
  let [, , resetIsShowing] = useTimeoutFn(() => setIsShowing(false), 1000);
  const [parameter, setParameter] = useState<Parameters>({
    create_date: setHours(setMinutes(setSeconds(new Date(), 0), 0), 0),
    interval: "month",
    interval_count: 1,
    billing_cycle_anchor: null,
    trial_end: null,
    proration_behavior: "none",
    unit_amount: 1000,
    currency: "usd",
    usage_type: "licensed",
    tiers_mode: "",
    aggregate_usage: "sum",
    pricingTiers: [
      { up_to: 1, unit_amount: 1000, flat_amount: 0 },
      { up_to: "inf", unit_amount: 1000, flat_amount: 0 },
    ],
    usageRecord: [
      {
        quantity: 1,
        action: "increment",
        timestamp: setHours(setMinutes(setSeconds(new Date(), 0), 0), 0),
      },
    ],
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textAreaRef.current!.value);
    setIsShowing(true);
    resetIsShowing();
  };
  const downloadBillingSchedule = () => {
    htmlToImage
      .toPng(document.getElementById("billingSchedule")!, {
        backgroundColor: "#f6f9fb",
        quality: 1,
        cacheBust: true,
      })
      .then(function (dataUrl) {
        downloadjs(dataUrl, "BillingSchedule.png");
      });
  };

  return (
    <>
      <Navbar />

      <div className=" max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-5xl xl:max-w-7xl mx-auto">
        <p className="mt-5 text-base text-gray-500 max-w-none  prose prose-xl prose-indigo ">
          A unofficial tool to help you to visualize Stripe Billing Schedule and
          generate a postman api collection to run the subscription through each
          event.{" "}
          <a
            className=""
            href="/docs/HowToUse"
            target="_blank"
            rel="noopener noreferrer"
          >
            how to use
          </a>{" "}
        </p>

        <Head>
          <title>Billing Simulator</title>
          <meta name="description" content="Stripe Billing Simulator " />
          <link rel="icon" href="/billing-larma.svg" />
        </Head>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="md:col-span-1">
            <Formik
              initialValues={initValues}
              validationSchema={SimulatorValidationSchema()}
              onSubmit={(values) => {
                gtag.event({
                  action: "submit_form",
                  category: "Update",
                  label: "submit",
                  value: "submit",
                });
                setParameter(values);
                router.push(
                  `/?${queryString.stringify(
                    {
                      create_date: Math.floor(
                        Number(values.create_date) / 1000
                      ),
                      interval: values.interval,
                      interval_count: values.interval_count,
                      billing_cycle_anchor: Math.floor(
                        Number(values.billing_cycle_anchor) / 1000
                      ),
                      trial_end: Math.floor(Number(values.trial_end) / 1000),
                      proration_behavior: values.proration_behavior,
                      unit_amount: values.unit_amount,
                      currency: values.currency,
                      usage_type: values.usage_type,
                      tiers_mode: values.tiers_mode,
                      aggregate_usage: values.aggregate_usage,
                      pricingTiers: values.pricingTiers.map((i) =>
                        JSON.stringify(i)
                      ),
                      usageRecord: values.usageRecord
                        .map((i) => ({
                          quantity: i.quantity,
                          action: i.action,
                          timestamp: Math.floor(Number(i.timestamp) / 1000),
                        }))
                        .map((i) => JSON.stringify(i)),
                    },
                    { arrayFormat: "index" }
                  )}`,
                  undefined,
                  {
                    shallow: true,
                  }
                );
              }}
            >
              {({
                values,
                handleChange,
                handleBlur,
                errors,
                setFieldValue,
                touched,
              }) => (
                <Form className="space-y-8 divide-y divide-gray-200">
                  <Submission />
                  <div className="pt-5">
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Schedule
                          </h3>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"create_date"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] prose prose-sm rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Date and time the Subscription API was called.
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <DatePicker
                            id="create_date"
                            selected={values.create_date}
                            nextMonthButtonLabel=">"
                            previousMonthButtonLabel="<"
                            onChange={(date) => {
                              gtag.event({
                                action: "update_create_date",
                                category: "Update",
                                label: "Update",
                                value: "Update",
                              });
                              setFieldValue("create_date", date);
                            }}
                            onBlur={handleBlur}
                            value={values.create_date as unknown as string}
                            autoComplete="off"
                            showTimeInput
                            dateFormat="MM/dd/yyyy hh:mm:ss"
                          />
                        </div>
                        {errors.create_date ? (
                          <div className="text-sm text-red-600">
                            {errors.create_date as string}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        {/* <label
                      htmlFor="billing_cycle_anchor"
                      className="block text-sm font-medium text-gray-700"
                    >
                      billing_cycle_anchor
                    </label> */}
                        <InputLabel
                          labelName={"billing_cycle_anchor"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              A future timestamp to anchor the subscription’s
                              billing cycle.{" "}
                              <a
                                href="https://stripe.com/docs/api/subscriptions/create#create_subscription-billing_cycle_anchor"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <DatePicker
                            id="billing_cycle_anchor"
                            selected={values.billing_cycle_anchor}
                            minDate={
                              values.trial_end === null
                                ? values.create_date
                                : values.trial_end
                            }
                            nextMonthButtonLabel=">"
                            previousMonthButtonLabel="<"
                            isClearable
                            onChange={(date) => {
                              gtag.event({
                                action: "update_billing_cycle_anchor",
                                category: "Update",
                                label: "Update",
                                value: "Update",
                              });
                              setFieldValue("billing_cycle_anchor", date);
                            }}
                            onBlur={handleBlur}
                            value={
                              values.billing_cycle_anchor
                                ? (values.billing_cycle_anchor as unknown as string)
                                : ""
                            }
                            autoComplete="off"
                            showTimeInput
                            dateFormat="MM/dd/yyyy hh:mm:ss"
                          />
                        </div>
                        {errors.billing_cycle_anchor ? (
                          <div className="text-sm text-red-600">
                            {errors.billing_cycle_anchor}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"trial_end"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Date and time representing the end of the trial
                              period the customer will get before being charged
                              for the first time.{" "}
                              <a
                                href="https://stripe.com/docs/api/subscriptions/create#create_subscription-trial_end"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <DatePicker
                            id="trial_end"
                            selected={values.trial_end}
                            minDate={values.create_date}
                            isClearable
                            showDisabledMonthNavigation
                            nextMonthButtonLabel=">"
                            previousMonthButtonLabel="<"
                            onChange={(date) => {
                              gtag.event({
                                action: "update_trial_end",
                                category: "Update",
                                label: "Update",
                                value: "Update",
                              });
                              setFieldValue("trial_end", date);
                            }}
                            onBlur={handleBlur}
                            value={values.trial_end as unknown as string}
                            autoComplete="off"
                            showTimeInput
                            dateFormat="MM/dd/yyyy hh:mm:ss"
                          />
                        </div>
                        {errors.trial_end ? (
                          <div className="text-sm text-red-600">
                            {errors.trial_end}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"proration_behavior"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Determines how to handle prorations resulting from
                              the billing_cycle_anchor.{" "}
                              <a
                                href="https://stripe.com/docs/api/subscriptions/create#create_subscription-proration_behavior"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <select
                            id="proration_behavior"
                            name="proration_behavior"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.proration_behavior}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          >
                            <option>none</option>
                            <option>create_prorations</option>
                          </select>
                        </div>
                        {touched.proration_behavior &&
                        errors.proration_behavior ? (
                          <div className="text-sm text-red-600">
                            {errors.proration_behavior}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-2 border-t pt-5 lg:mt-28">
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Price
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 prose prose-indigo">
                            Billing Simulator doesn't support all{" "}
                            <a
                              className=""
                              href="https://stripe.com/docs/products-prices/pricing-models"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              complex pricing model
                            </a>{" "}
                            now. You can add additional paramter once you import
                            the script to postman.
                          </p>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"unit_amount"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              A positive integer representing how much to
                              charge.{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/create#create_price-unit_amount"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <input
                            disabled={values.tiers_mode !== ""}
                            type="number"
                            name="unit_amount"
                            id="unit_amount"
                            className={
                              values.tiers_mode !== ""
                                ? "shadow-sm text-gray-500 bg-gray-100 block w-full sm:text-sm border-gray-300 rounded-md"
                                : "shadow-sm  focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            }
                            value={values.unit_amount}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                        </div>
                        {touched.unit_amount && errors.unit_amount ? (
                          <div className="text-sm text-red-600">
                            {errors.unit_amount}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"currency"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Three-letter ISO currency code, in lowercase. Must
                              be a supported currency.{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/create#create_price-currency"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <select
                            id="currency"
                            name="currency"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.currency}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          >
                            <option value={"usd"}>usd</option>
                            <option value={"aud"}>aud</option>
                            <option value={"nzd"}>nzd</option>
                            <option value={"jpy"}>jpy</option>
                            <option value={"cny"}>cny</option>
                            <option value={"eur"}>eur</option>
                            <option value={"sgd"}>sgd</option>
                          </select>
                        </div>
                        {touched.currency && errors.currency ? (
                          <div className="text-sm text-red-600">
                            {errors.currency}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"interval"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Specifies billing frequency. Either day, week,
                              month or year.{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/create#create_price-recurring-interval"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <select
                            id="interval"
                            name="interval"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.interval}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          >
                            <option value={"month"}>month</option>
                            <option value={"year"}>year</option>
                            <option value={"week"}>week</option>
                            <option value={"day"}>day</option>
                          </select>
                        </div>
                        {touched.interval && errors.interval ? (
                          <div className="text-sm text-red-600">
                            {errors.interval}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"interval_count"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              The number of intervals between subscription
                              billings. For example, interval=month and
                              interval_count=3 bills every 3 months. Maximum of
                              one year interval allowed (1 year, 12 months, or
                              52 weeks).{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/create#create_price-recurring-interval_count"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <input
                            type="number"
                            name="interval_count"
                            id="interval_count"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.interval_count}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          />
                        </div>
                        {touched.interval_count && errors.interval_count ? (
                          <div className="text-sm text-red-600">
                            {errors.interval_count}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"usage_type"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              Configures how the quantity per period should be
                              determined.{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/object#price_object-recurring-usage_type"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <select
                            id="usage_type"
                            name="usage_type"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.usage_type}
                            onBlur={handleBlur}
                            onChange={handleChange}
                          >
                            <option value={"licensed"}>licensed</option>
                            <option value={"metered"}>metered</option>
                          </select>
                        </div>
                        {touched.usage_type && errors.usage_type ? (
                          <div className="text-sm text-red-600">
                            {errors.usage_type}
                          </div>
                        ) : null}
                      </div>
                      <div className="sm:col-span-1">
                        <InputLabel
                          labelName={"tiers_mode"}
                          tooltipContents={
                            <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                              In volume-based tiering, the maximum quantity
                              within a period determines the per unit price. In
                              graduated tiering, pricing can change as the
                              quantity grows.{" "}
                              <a
                                href="https://stripe.com/docs/api/prices/object#price_object-tiers_mode"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                more
                              </a>
                            </p>
                          }
                        />
                        <div className="mt-1">
                          <select
                            id="tiers_mode"
                            name="tiers_mode"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={values.tiers_mode}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              if (e.target.value === "") {
                                setFieldValue("pricingTiers", [
                                  {
                                    up_to: 1,
                                    unit_amount: 1000,
                                    flat_amount: 0,
                                  },
                                  {
                                    up_to: "inf",
                                    unit_amount: 1000,
                                    flat_amount: 0,
                                  },
                                ]);
                              }

                              setFieldValue("tiers_mode", e.target.value);
                            }}
                          >
                            <option value={""}>none</option>
                            <option value={"volume"}>volume</option>
                            <option value={"graduated"}>graduated</option>
                          </select>
                        </div>
                        {touched.tiers_mode && errors.tiers_mode ? (
                          <div className="text-sm text-red-600">
                            {errors.tiers_mode}
                          </div>
                        ) : null}
                      </div>

                      {values.usage_type === "metered" ? (
                        <>
                          <div className="sm:col-span-2">
                            <InputLabel
                              labelName={"aggregate_usage"}
                              tooltipContents={
                                <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                                  Specifies a usage aggregation strategy for
                                  prices of usage_type=metered.{" "}
                                  <a
                                    href="https://stripe.com/docs/api/prices/object#price_object-recurring-aggregate_usage"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {" "}
                                    more
                                  </a>
                                </p>
                              }
                            />
                            <div className="mt-1">
                              <select
                                id="aggregate_usage"
                                name="aggregate_usage"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                value={values.aggregate_usage}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              >
                                <option value={"sum"}>sum</option>
                                <option disabled value={"last_during_period"}>
                                  last_during_period
                                </option>
                                <option disabled value={"last_ever"}>
                                  last_ever
                                </option>
                                <option disabled value={"max"}>
                                  max
                                </option>
                              </select>
                            </div>
                            {touched.aggregate_usage &&
                            errors.aggregate_usage ? (
                              <div className="text-sm text-red-600">
                                {errors.aggregate_usage}
                              </div>
                            ) : null}
                          </div>
                          <MetersTable
                            values={values}
                            errors={errors}
                            touched={touched}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                          />
                        </>
                      ) : null}

                      <TiersTable
                        values={values}
                        errors={errors}
                        touched={touched}
                      />
                    </div>
                  </div>
                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div className="md:col-span-2">
            <div className="mt-8 relative">
              <div className="bg-[#F6F9FB] group relative ">
                <button
                  type="button"
                  className="downloadButton flex items-center justify-center  invisible  h-8 w-8  group-hover:visible rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 absolute  top-0 right-0 z-50"
                  onClick={downloadBillingSchedule}
                >
                  <DownloadIcon
                    className="h-6 text-gray-600"
                    aria-hidden="true"
                  />
                </button>
                <div id="billingSchedule">
                  <Eventpoint parameter={parameter} />

                  <div className=" h-1  bg-yellow-500 w-full" />
                  <Timeline parameter={parameter} />
                  <Period parameter={parameter} />
                </div>
              </div>
              {parameter.usage_type === "metered" ? (
                <MeteredChart parameter={parameter} />
              ) : null}
              <div className="mt-4">
                <PricingChart pricingData={parameter} />
              </div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4 mb-2">
                  Postman Import Script
                </h3>
              </div>
              <div className=" relative group mb-10">
                <button
                  type="button"
                  className=" flex items-center justify-center invisible group-hover:visible  h-8 w-8 group  rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 absolute  top-1 right-4 z-50"
                  onClick={copyToClipboard}
                >
                  <Transition
                    as={Fragment}
                    show={isShowing}
                    enter="transform transition duration-[200ms]"
                    enterFrom="opacity-0  scale-50"
                    enterTo="opacity-100 scale-100"
                    leave="transform duration-200 transition ease-in-out"
                    leaveFrom="opacity-100 scale-100 "
                    leaveTo="opacity-0 scale-95 "
                  >
                    <a className=" absolute  -top-12 text-gray-100  bg-slate-800  p-2 rounded-md   invisible  group-focus:visible  ">
                      copied!
                    </a>
                  </Transition>
                  <ClipboardCopyIcon
                    className="h-6 text-gray-600"
                    aria-hidden="true"
                  />
                </button>
                <textarea
                  id="about"
                  name="about"
                  disabled
                  ref={textAreaRef}
                  // rows="3"
                  className=" shadow-sm block w-full h-56 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                  value={postmanExport(parameter)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
