import Head from "next/head";
import React, { useRef, useState, Fragment } from "react";
import { useTimeoutFn } from "react-use";
import { Transition } from "@headlessui/react";
import {
  DownloadIcon,
  ClipboardCopyIcon,
  PlusIcon,
  XIcon,
} from "@heroicons/react/solid";

import { Formik, Form, Field, FieldArray } from "formik";
import SimulatorValidationSchema from "../components/SimulatorValidationSchema";

import * as htmlToImage from "html-to-image";
import downloadjs from "downloadjs";

import * as gtag from "../utils/gtag";
import { postmanExport } from "../utils/postmanExport";

import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";

import dynamic from "next/dynamic";

import Navbar from "../components/Navbar";
import Timeline from "../components/Timeline";
import InputLabel from "../components/InputLabel";
import PricingChart from "../components/PricingChart";

const Eventpoint = dynamic(() => import("../components/Eventpoint"), {
  ssr: false,
});
const Period = dynamic(() => import("../components/Period"), {
  ssr: false,
});

export default function Home() {
  const textAreaRef = useRef(null);

  // const router = useRouter();
  // const { intial_create_date, intial_interval_count } = router.query;
  // console.log("query:" + JSON.stringify(query));

  let [isShowing, setIsShowing] = useState(false);
  // const [pricingTiers, setPricingTiers] = useState([
  //   { id: 1, up_to: 1, unit_amount: 1000, flat_amount: 0 },
  // ]);
  let [, , resetIsShowing] = useTimeoutFn(() => setIsShowing(false), 1000);
  const [parameter, setParameter] = useState({
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
    pricingTiers: [
      { up_to: 1, unit_amount: 1000, flat_amount: 0 },
      { up_to: "inf", unit_amount: 1000, flat_amount: 0 },
    ],
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textAreaRef.current.value);
    setIsShowing(true);
    resetIsShowing();
  };
  const downloadBillingSchedule = () => {
    htmlToImage
      .toPng(document.getElementById("billingSchedule"), {
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
              initialValues={{
                create_date: setHours(
                  setMinutes(setSeconds(new Date(), 0), 0),
                  0
                ),
                interval: "month",
                interval_count: 1,
                billing_cycle_anchor: null,
                trial_end: null,
                proration_behavior: "none",
                unit_amount: 1000,
                currency: "usd",
                usage_type: "licensed",
                tiers_mode: "",
                pricingTiers: [
                  { up_to: 1, unit_amount: 1000, flat_amount: 0 },
                  { up_to: "inf", unit_amount: 1000, flat_amount: 0 },
                ],
              }}
              validationSchema={SimulatorValidationSchema(parameter)}
              onSubmit={(values) => {
                gtag.event({
                  action: "submit_form",
                  category: "Update",
                });
                setParameter(values);
                // console.log(parameter);
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
                              });
                              setFieldValue("create_date", date);
                            }}
                            onBlur={handleBlur}
                            value={values.create_date}
                            autoComplete="off"
                            showTimeInput
                            dateFormat="MM/dd/yyyy hh:mm:ss"
                          />
                        </div>
                        {errors.create_date ? (
                          <div className="text-sm text-red-600">
                            {errors.create_date}
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
                              });
                              setFieldValue("billing_cycle_anchor", date);
                            }}
                            onBlur={handleBlur}
                            value={values.billing_cycle_anchor}
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
                              });
                              setFieldValue("trial_end", date);
                            }}
                            onBlur={handleBlur}
                            value={values.trial_end}
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
                      <div className="sm:col-span-2 border-t pt-5">
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
                            type="number"
                            name="unit_amount"
                            id="unit_amount"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                            <option disabled value={"metered"}>
                              metered (simulator doesn't support metered mode
                              yet)
                            </option>
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
                      <FieldArray
                        name="pricingTiers"
                        render={(arrayHelpers) =>
                          values.pricingTiers &&
                          values.pricingTiers.length > 0 &&
                          values.tiers_mode !== "" ? (
                            <div className="sm:col-span-2">
                              <div className="flex justify-between">
                                <InputLabel
                                  labelName={"tiers"}
                                  tooltipContents={
                                    <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                                      Each element represents a pricing tier.
                                      This parameter requires billing_scheme to
                                      be set to tiered. See also the
                                      documentation for billing_scheme.{" "}
                                      <a
                                        href="https://stripe.com/docs/api/prices/create#create_price-tiers"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {" "}
                                        more
                                      </a>
                                    </p>
                                  }
                                />
                                <button
                                  className=" inline-flex text-sm font-medium text-indigo-500 items-center"
                                  onClick={() =>
                                    arrayHelpers.insert(
                                      values.pricingTiers.length - 1,
                                      {
                                        up_to:
                                          values.pricingTiers[
                                            values.pricingTiers.length - 2
                                          ].up_to + 2,
                                        unit_amount: 1000,
                                        flat_amount: 0,
                                      }
                                    )
                                  }
                                >
                                  <PlusIcon className="w-4 h-4 text-indigo-500" />
                                  add tier
                                </button>
                              </div>

                              <div>
                                <div className="mt-1 flex flex-col">
                                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                      <div className=" shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ">
                                        <table className=" divide-y divide-gray-300 w-full">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th
                                                scope="col"
                                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                              >
                                                #
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                              >
                                                up_to
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                              >
                                                unit_amount
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                              >
                                                flat_amount
                                              </th>
                                              <th
                                                scope="col"
                                                className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                                              >
                                                <span className="sr-only">
                                                  Edit
                                                </span>
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200 bg-white">
                                            {values.pricingTiers.map(
                                              (tier, index) => (
                                                <tr key={index}>
                                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {index + 1}
                                                  </td>
                                                  <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500">
                                                    <Field
                                                      name={`pricingTiers.${index}.up_to`}
                                                    >
                                                      {({ field }) => (
                                                        <div className=" relative group">
                                                          <input
                                                            className={
                                                              errors &&
                                                              errors.pricingTiers &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ].up_to &&
                                                              touched &&
                                                              touched.pricingTiers &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ].up_to
                                                                ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                                                : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            }
                                                            type={
                                                              index ===
                                                              values
                                                                .pricingTiers
                                                                .length -
                                                                1
                                                                ? "text"
                                                                : "number"
                                                            }
                                                            disabled={
                                                              index ===
                                                              values
                                                                .pricingTiers
                                                                .length -
                                                                1
                                                            }
                                                            {...field}
                                                          />
                                                          {errors &&
                                                            errors.pricingTiers &&
                                                            errors.pricingTiers[
                                                              index
                                                            ] &&
                                                            errors.pricingTiers[
                                                              index
                                                            ].up_to &&
                                                            touched &&
                                                            touched.pricingTiers &&
                                                            touched
                                                              .pricingTiers[
                                                              index
                                                            ] &&
                                                            touched
                                                              .pricingTiers[
                                                              index
                                                            ].up_to && (
                                                              <div className="block">
                                                                <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                                                  {
                                                                    errors
                                                                      .pricingTiers[
                                                                      index
                                                                    ].up_to
                                                                  }
                                                                </p>
                                                              </div>
                                                            )}
                                                        </div>
                                                      )}
                                                    </Field>
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 ">
                                                    <Field
                                                      name={`pricingTiers.${index}.unit_amount`}
                                                    >
                                                      {({ field }) => (
                                                        <div className=" block relative group">
                                                          <input
                                                            className={
                                                              errors &&
                                                              errors.pricingTiers &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ].unit_amount &&
                                                              touched &&
                                                              touched.pricingTiers &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ].unit_amount
                                                                ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                                                : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            }
                                                            type="number"
                                                            {...field}
                                                          />
                                                          {errors &&
                                                            errors.pricingTiers &&
                                                            errors.pricingTiers[
                                                              index
                                                            ] &&
                                                            errors.pricingTiers[
                                                              index
                                                            ].unit_amount &&
                                                            touched &&
                                                            touched.pricingTiers &&
                                                            touched
                                                              .pricingTiers[
                                                              index
                                                            ] &&
                                                            touched
                                                              .pricingTiers[
                                                              index
                                                            ].unit_amount && (
                                                              <div className="">
                                                                <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                                                  {
                                                                    errors
                                                                      .pricingTiers[
                                                                      index
                                                                    ]
                                                                      .unit_amount
                                                                  }
                                                                </p>
                                                              </div>
                                                            )}
                                                        </div>
                                                      )}
                                                    </Field>
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 group relative">
                                                    <Field
                                                      name={`pricingTiers.${index}.flat_amount`}
                                                    >
                                                      {({ field }) => (
                                                        <div className=" ">
                                                          <input
                                                            className={
                                                              errors &&
                                                              errors.pricingTiers &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ].flat_amount &&
                                                              touched &&
                                                              touched.pricingTiers &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ] &&
                                                              touched
                                                                .pricingTiers[
                                                                index
                                                              ].flat_amount
                                                                ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                                                : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            }
                                                            type="number"
                                                            {...field}
                                                          />
                                                        </div>
                                                      )}
                                                    </Field>
                                                    {errors &&
                                                      errors.pricingTiers &&
                                                      errors.pricingTiers[
                                                        index
                                                      ] &&
                                                      errors.pricingTiers[index]
                                                        .flat_amount &&
                                                      touched &&
                                                      touched.pricingTiers &&
                                                      touched.pricingTiers[
                                                        index
                                                      ] &&
                                                      touched.pricingTiers[
                                                        index
                                                      ].flat_amount && (
                                                        <div className="">
                                                          <p className="text-red-600  before:contents-[''] before:absolute before:-bottom-3 before:right-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible  bg-white  p-2 text-sm inline-block   absolute bottom-16 right-3 shadow-lg	 ">
                                                            {
                                                              errors
                                                                .pricingTiers[
                                                                index
                                                              ].flat_amount
                                                            }
                                                          </p>
                                                        </div>
                                                      )}
                                                  </td>
                                                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                      className="disabled:opacity-0"
                                                      disabled={
                                                        index ===
                                                          values.pricingTiers
                                                            .length -
                                                            1 || index === 0
                                                      }
                                                      onClick={() =>
                                                        arrayHelpers.remove(
                                                          index
                                                        )
                                                      }
                                                    >
                                                      <XIcon
                                                        disabled
                                                        className="w-4 h-4 text-indigo-500 "
                                                      />
                                                    </button>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null
                        }
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

// export async function getServerSideProps({ query }) {
//   // console.log(query); // `{ id: 'foo' }`
//   //...
//   return {
//     props: { query }, // will be passed to the page component as props
//   };
// }
