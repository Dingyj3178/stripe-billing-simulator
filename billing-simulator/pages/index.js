import Head from "next/head";
import React, { useRef, useState, Fragment } from "react";
import { useTimeoutFn } from "react-use";
import { Transition } from "@headlessui/react";
import { DownloadIcon, ClipboardCopyIcon } from "@heroicons/react/solid";

import { useFormik } from "formik";
import * as Yup from "yup";

import * as htmlToImage from "html-to-image";
import downloadjs from "downloadjs";

import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";
import addMonths from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addDays from "date-fns/addDays";
import addYears from "date-fns/addYears";
import addHours from "date-fns/addHours";

import dynamic from "next/dynamic";

import Navbar from "../components/Navbar";
import Timeline from "../components/Timeline";
// import Eventpoint from "../components/Eventpoint";
// import Period from "../components/Period";

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

  const calculateUpdate = () => {
    const endDate =
      parameter.billing_cycle_anchor !== null
        ? parameter.billing_cycle_anchor
        : parameter.trial_end !== null
        ? parameter.trial_end
        : parameter.create_date;
    const updateDate =
      parameter.interval === "year"
        ? addYears(new Date(endDate), parameter.interval_count * 1)
        : parameter.interval === "month"
        ? addMonths(new Date(endDate), parameter.interval_count * 1)
        : parameter.interval === "week"
        ? addWeeks(new Date(endDate), parameter.interval_count * 1)
        : addDays(new Date(endDate), parameter.interval_count * 1);
    return updateDate;
  };

  const formik = useFormik({
    initialValues: {
      create_date: setHours(setMinutes(setSeconds(new Date(), 0), 0), 0),
      interval: "month",
      interval_count: 1,
      billing_cycle_anchor: null,
      trial_end: null,
      proration_behavior: "none",
      unit_amount: 1000,
      currency: "usd",
    },
    validationSchema: Yup.object({
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
    }),
    onSubmit: (values) => {
      setParameter(values);
      // console.log(parameter);
    },
  });

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
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="md:col-span-1">
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-8 divide-y divide-gray-200"
            >
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
                    <label
                      htmlFor="create_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      create_date
                    </label>
                    <div className="mt-1">
                      <DatePicker
                        id="create_date"
                        selected={formik.values.create_date}
                        nextMonthButtonLabel=">"
                        previousMonthButtonLabel="<"
                        onChange={(date) => {
                          formik.setFieldValue("create_date", date);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.create_date}
                        autoComplete="off"
                        showTimeInput
                        dateFormat="MM/dd/yyyy hh:mm:ss"
                      />
                    </div>
                    {formik.errors.create_date ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.create_date}
                      </div>
                    ) : null}
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="billing_cycle_anchor"
                      className="block text-sm font-medium text-gray-700"
                    >
                      billing_cycle_anchor
                    </label>
                    <div className="mt-1">
                      <DatePicker
                        id="billing_cycle_anchor"
                        selected={formik.values.billing_cycle_anchor}
                        minDate={
                          formik.values.trial_end === null
                            ? formik.values.create_date
                            : formik.values.trial_end
                        }
                        nextMonthButtonLabel=">"
                        previousMonthButtonLabel="<"
                        isClearable
                        onChange={(date) => {
                          formik.setFieldValue("billing_cycle_anchor", date);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.billing_cycle_anchor}
                        autoComplete="off"
                        showTimeInput
                        dateFormat="MM/dd/yyyy hh:mm:ss"
                      />
                    </div>
                    {formik.errors.billing_cycle_anchor ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.billing_cycle_anchor}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      trial_end
                    </label>
                    <div className="mt-1">
                      <DatePicker
                        id="trial_end"
                        selected={formik.values.trial_end}
                        minDate={formik.values.create_date}
                        isClearable
                        showDisabledMonthNavigation
                        nextMonthButtonLabel=">"
                        previousMonthButtonLabel="<"
                        onChange={(date) => {
                          formik.setFieldValue("trial_end", date);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.trial_end}
                        autoComplete="off"
                        showTimeInput
                        dateFormat="MM/dd/yyyy hh:mm:ss"
                      />
                    </div>
                    {formik.errors.trial_end ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.trial_end}
                      </div>
                    ) : null}
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      proration_behavior
                    </label>
                    <div className="mt-1">
                      <select
                        id="proration_behavior"
                        name="proration_behavior"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formik.values.proration_behavior}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      >
                        <option>none</option>
                        <option>create_prorations</option>
                      </select>
                    </div>
                    {formik.touched.proration_behavior &&
                    formik.errors.proration_behavior ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.proration_behavior}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-2 border-t pt-5">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Price
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 prose prose-indigo">
                        Billing Simulator doesn't support{" "}
                        <a
                          className=""
                          href="https://stripe.com/docs/products-prices/pricing-models"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          complex pricing model
                        </a>{" "}
                        now. You can add additional paramter after the import of
                        postman.
                      </p>
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      unit_amount
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="unit_amount"
                        id="unit_amount"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formik.values.unit_amount}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      />
                    </div>
                    {formik.touched.unit_amount && formik.errors.unit_amount ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.unit_amount}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="interval"
                      className="block text-sm font-medium text-gray-700"
                    >
                      currency
                    </label>
                    <div className="mt-1">
                      <select
                        id="currency"
                        name="currency"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formik.values.currency}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      >
                        <option value={"usd"}>usd</option>
                      </select>
                    </div>
                    {formik.touched.currency && formik.errors.currency ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.currency}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="interval"
                      className="block text-sm font-medium text-gray-700"
                    >
                      interval
                    </label>
                    <div className="mt-1">
                      <select
                        id="interval"
                        name="interval"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formik.values.interval}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      >
                        <option value={"month"}>month</option>
                        <option value={"year"}>year</option>
                        <option value={"week"}>week</option>
                        <option value={"day"}>day</option>
                      </select>
                    </div>
                    {formik.touched.interval && formik.errors.interval ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.interval}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="interval_count"
                      className="block text-sm font-medium text-gray-700"
                    >
                      interval_count
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="interval_count"
                        id="interval_count"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formik.values.interval_count}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      />
                    </div>
                    {formik.touched.interval_count &&
                    formik.errors.interval_count ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.interval_count}
                      </div>
                    ) : null}
                  </div>
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
            </form>
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
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4 mb-2">
                  Postman Import Script
                </h3>
              </div>
              <div className=" relative group">
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
                  value={JSON.stringify(
                    {
                      info: {
                        _postman_id:
                          "billing_simulator" +
                          "_" +
                          new Date().toISOString().slice(0, 19),
                        name:
                          `billing_simulator` +
                          "_" +
                          new Date().toISOString().slice(0, 19),
                        schema:
                          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
                      },
                      auth: {
                        type: "bearer",
                        bearer: [
                          {
                            key: "token",
                            value: "{{secret_key}}",
                            type: "string",
                          },
                        ],
                      },
                      item: [
                        {
                          name: "/test_helpers/test_clocks",
                          event: [
                            {
                              listen: "test",
                              script: {
                                exec: [
                                  'pm.collectionVariables.set("clock_id", pm.response.json().id);',
                                ],
                                type: "text/javascript",
                              },
                            },
                          ],
                          description: "create test clock",
                          request: {
                            method: "post",
                            header: [],
                            url: {
                              raw: "https://api.stripe.com",
                              protocol: "https",
                              host: ["api", "stripe", "com"],
                              path: ["v1", "test_helpers", "test_clocks"],
                            },
                            body: {
                              mode: "urlencoded",
                              urlencoded: [
                                {
                                  key: "frozen_time",
                                  value: Math.floor(
                                    parameter.create_date.getTime() / 1000
                                  ),
                                  type: "text",
                                },
                              ],
                            },
                          },
                          response: [],
                        },
                        {
                          name: "/prices",
                          description: `Billing Simulator ${parameter.interval} product`,
                          request: {
                            method: "post",
                            header: [],
                            url: {
                              raw: "https://api.stripe.com",
                              protocol: "https",
                              host: ["api", "stripe", "com"],
                              path: ["v1", "prices"],
                            },
                            body: {
                              mode: "urlencoded",
                              urlencoded: [
                                {
                                  key: "currency",
                                  value: parameter.currency,
                                  type: "text",
                                },
                                {
                                  key: "unit_amount",
                                  value: parameter.unit_amount,
                                  type: "text",
                                },
                                {
                                  key: "product_data[name]",
                                  value:
                                    `Billing Simulator ${parameter.interval} product` +
                                    "_" +
                                    new Date().toISOString().slice(0, 19),
                                  type: "text",
                                },
                                {
                                  key: "recurring[interval]",
                                  value: parameter.interval,
                                  type: "text",
                                },
                                {
                                  key: "recurring[usage_type]",
                                  value: "licensed",
                                  type: "text",
                                },
                                {
                                  key: "recurring[interval_count]",
                                  value: parameter.interval_count,
                                  type: "text",
                                },
                              ],
                            },
                          },
                          event: [
                            {
                              listen: "test",
                              script: {
                                exec: [
                                  'pm.collectionVariables.set("price_id", pm.response.json().id);',
                                ],
                                type: "text/javascript",
                              },
                            },
                          ],
                          response: [],
                        },
                        {
                          name: "/customers",
                          description: "",
                          request: {
                            method: "post",
                            header: [],
                            url: {
                              raw: "https://api.stripe.com",
                              protocol: "https",
                              host: ["api", "stripe", "com"],
                              path: ["v1", "customers"],
                            },
                            body: {
                              mode: "urlencoded",
                              urlencoded: [
                                {
                                  key: "test_clock",
                                  value: "{{clock_id}}",
                                  type: "text",
                                },
                                {
                                  key: "name",
                                  value:
                                    "Billing_Simulator_Test_Cusotmer" +
                                    "_" +
                                    new Date().toISOString().slice(0, 19),
                                  type: "text",
                                },
                                {
                                  key: "payment_method",
                                  value: "pm_card_visa",
                                  type: "text",
                                },
                                {
                                  key: "invoice_settings[default_payment_method]",
                                  value: "pm_card_visa",
                                  type: "text",
                                },
                                {
                                  key: "email",
                                  value: "kokaj91545@cupbest.com",
                                  type: "text",
                                },
                              ],
                            },
                          },
                          event: [
                            {
                              listen: "test",
                              script: {
                                exec: [
                                  'pm.collectionVariables.set("customer_id", pm.response.json().id);',
                                ],
                                type: "text/javascript",
                              },
                            },
                          ],
                          response: [],
                        },
                        {
                          name: "/subscriptions",
                          description: "",
                          request: {
                            method: "post",
                            header: [],
                            url: {
                              raw: "https://api.stripe.com",
                              protocol: "https",
                              host: ["api", "stripe", "com"],
                              path: ["v1", "subscriptions"],
                            },
                            body: {
                              mode: "urlencoded",
                              urlencoded: [
                                {
                                  key: "customer",
                                  value: "{{customer_id}}",
                                  type: "text",
                                },
                                {
                                  key: "items[0][price]",
                                  value: "{{price_id}}",
                                  type: "text",
                                },
                                {
                                  key: "items[0][quantity]",
                                  value: "1",
                                  type: "text",
                                },
                                {
                                  key: "proration_behavior",
                                  value: parameter.proration_behavior,
                                  type: "text",
                                },
                                parameter.trial_end !== null
                                  ? {
                                      key: "trial_end",
                                      value: Math.floor(
                                        parameter.trial_end.getTime() / 1000
                                      ),
                                      type: "text",
                                    }
                                  : "",
                                parameter.billing_cycle_anchor !== null
                                  ? {
                                      key: "billing_cycle_anchor",
                                      value: Math.floor(
                                        parameter.billing_cycle_anchor.getTime() /
                                          1000
                                      ),
                                      type: "text",
                                    }
                                  : "",
                              ],
                            },
                          },
                          event: [],
                          response: [],
                        },
                        parameter.trial_end !== null
                          ? {
                              name: "/test_helpers/test_clocks/{{clock_id}}/advance",
                              description: "advance to trial end date",
                              request: {
                                method: "post",
                                header: [],
                                url: {
                                  raw: "https://api.stripe.com",
                                  protocol: "https",
                                  host: ["api", "stripe", "com"],
                                  path: [
                                    "v1",
                                    "test_helpers",
                                    "test_clocks",
                                    "{{clock_id}}",
                                    "advance",
                                  ],
                                },
                                body: {
                                  mode: "urlencoded",
                                  urlencoded: [
                                    {
                                      key: "frozen_time",
                                      value: Math.floor(
                                        parameter.trial_end.getTime() / 1000
                                      ),
                                      type: "text",
                                    },
                                  ],
                                },
                              },
                              event: [],
                              response: [],
                            }
                          : "",
                        parameter.billing_cycle_anchor !== null
                          ? {
                              name: "/test_helpers/test_clocks/{{clock_id}}/advance",
                              description: "advance to billing cycle anchor",
                              request: {
                                method: "post",
                                header: [],
                                url: {
                                  raw: "https://api.stripe.com",
                                  protocol: "https",
                                  host: ["api", "stripe", "com"],
                                  path: [
                                    "v1",
                                    "test_helpers",
                                    "test_clocks",
                                    "{{clock_id}}",
                                    "advance",
                                  ],
                                },
                                body: {
                                  mode: "urlencoded",
                                  urlencoded: [
                                    {
                                      key: "frozen_time",
                                      value: Math.floor(
                                        addHours(
                                          parameter.billing_cycle_anchor.getTime(),
                                          1
                                        ) / 1000
                                      ),
                                      type: "text",
                                    },
                                  ],
                                },
                              },
                              event: [
                                {
                                  listen: "prerequest",
                                  script: {
                                    exec: [
                                      'pm.collectionVariables.set("clock_status", "not_ready");',
                                      "",
                                      "const sendRequest = () => {",
                                      "    pm.sendRequest({",
                                      '        url: "https://api.stripe.com/v1/test_helpers/test_clocks/" + pm.variables.get("clock_id"),',
                                      '        method: "get",',
                                      "        header: {",
                                      "            'Authorization': 'Bearer' + ' ' + pm.environment.get(\"secret_key\"),",
                                      "        },",
                                      "    }, function (err, response) {",
                                      "        console.log(response.json())",
                                      "        if (response.json().status !== 'ready') {",
                                      "            checkClock();",
                                      "",
                                      "        } else {",
                                      "            pm.collectionVariables.set('clock_status', response.json().status)",
                                      "        }",
                                      "",
                                      "    })",
                                      "}",
                                      "",
                                      "const checkClock = async () => {",
                                      "    if (pm.variables.get('clock_status') === 'ready') {",
                                      "        return null",
                                      "    }",
                                      "    else {",
                                      "        setTimeout(",
                                      "            sendRequest, 5000)",
                                      "    }",
                                      "}",
                                      "checkClock();",
                                      "",
                                    ],
                                    type: "text/javascript",
                                  },
                                },
                              ],
                              response: [],
                            }
                          : "",
                        {
                          name: "/test_helpers/test_clocks/{{clock_id}}/advance",
                          description: "advance to first update date",
                          request: {
                            method: "post",
                            header: [],
                            url: {
                              raw: "https://api.stripe.com",
                              protocol: "https",
                              host: ["api", "stripe", "com"],
                              path: [
                                "v1",
                                "test_helpers",
                                "test_clocks",
                                "{{clock_id}}",
                                "advance",
                              ],
                            },
                            body: {
                              mode: "urlencoded",
                              urlencoded: [
                                {
                                  key: "frozen_time",
                                  value: Math.floor(
                                    addHours(calculateUpdate(), 1) / 1000
                                  ),
                                  type: "text",
                                },
                              ],
                            },
                          },
                          event: [
                            {
                              listen: "prerequest",
                              script: {
                                exec: [
                                  'pm.collectionVariables.set("clock_status", "not_ready");',
                                  "",
                                  "const sendRequest = () => {",
                                  "    pm.sendRequest({",
                                  '        url: "https://api.stripe.com/v1/test_helpers/test_clocks/" + pm.variables.get("clock_id"),',
                                  '        method: "get",',
                                  "        header: {",
                                  "            'Authorization': 'Bearer' + ' ' + pm.environment.get(\"secret_key\"),",
                                  "        },",
                                  "    }, function (err, response) {",
                                  "        console.log(response.json())",
                                  "        if (response.json().status !== 'ready') {",
                                  "            checkClock();",
                                  "",
                                  "        } else {",
                                  "            pm.collectionVariables.set('clock_status', response.json().status)",
                                  "        }",
                                  "",
                                  "    })",
                                  "}",
                                  "",
                                  "const checkClock = async () => {",
                                  "    if (pm.variables.get('clock_status') === 'ready') {",
                                  "        return null",
                                  "    }",
                                  "    else {",
                                  "        setTimeout(",
                                  "            sendRequest, 5000)",
                                  "    }",
                                  "}",
                                  "checkClock();",
                                  "",
                                ],
                                type: "text/javascript",
                              },
                            },
                          ],
                          response: [],
                        },
                      ],
                      variable: [
                        {
                          key: "secret_key",
                          value: "",
                        },
                      ],
                    },
                    null,
                    2
                  )}
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
