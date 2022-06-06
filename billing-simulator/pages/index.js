import Head from "next/head";
import React, { useRef, useState, Fragment } from "react";
import { useTimeoutFn } from "react-use";
import { Transition } from "@headlessui/react";
import { DownloadIcon, ClipboardCopyIcon } from "@heroicons/react/solid";

import { useFormik } from "formik";
import * as Yup from "yup";

import * as htmlToImage from "html-to-image";
import downloadjs from "downloadjs";

import * as gtag from "../utils/gtag";
import { postmanExport } from "../utils/postmanExport";
import { calculateUpdate } from "../utils/timelineHelper";

import DatePicker from "react-datepicker";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";
import setSeconds from "date-fns/setSeconds";

import dynamic from "next/dynamic";

import Navbar from "../components/Navbar";
import Timeline from "../components/Timeline";
import InputLabel from "../components/InputLabel";

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
    }),
    onSubmit: (values) => {
      gtag.event({
        action: "submit_form",
        category: "Update",
      });
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
          <meta name="description" content="Stripe Billing Simulator " />
          <link rel="icon" href="/billing-larma.svg" />
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
                    <InputLabel
                      labelName={"create_date"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] prose prose-sm rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          Date and time the Subscription API was called.
                        </p>
                      }
                    />
                    <div className="mt-1">
                      <DatePicker
                        id="create_date"
                        selected={formik.values.create_date}
                        nextMonthButtonLabel=">"
                        previousMonthButtonLabel="<"
                        onChange={(date) => {
                          gtag.event({
                            action: "update_create_date",
                            category: "Update",
                          });
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
                    {/* <label
                      htmlFor="billing_cycle_anchor"
                      className="block text-sm font-medium text-gray-700"
                    >
                      billing_cycle_anchor
                    </label> */}
                    <InputLabel
                      labelName={"billing_cycle_anchor"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
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
                          gtag.event({
                            action: "update_billing_cycle_anchor",
                            category: "Update",
                          });
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
                    <InputLabel
                      labelName={"trial_end"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          Date and time representing the end of the trial period
                          the customer will get before being charged for the
                          first time.{" "}
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
                        selected={formik.values.trial_end}
                        minDate={formik.values.create_date}
                        isClearable
                        showDisabledMonthNavigation
                        nextMonthButtonLabel=">"
                        previousMonthButtonLabel="<"
                        onChange={(date) => {
                          gtag.event({
                            action: "update_trial_end",
                            category: "Update",
                          });
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
                    <InputLabel
                      labelName={"proration_behavior"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          Determines how to handle prorations resulting from the
                          billing_cycle_anchor.{" "}
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
                    <InputLabel
                      labelName={"unit_amount"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          A positive integer representing how much to charge.{" "}
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
                    <InputLabel
                      labelName={"currency"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          Three-letter ISO currency code, in lowercase. Must be
                          a supported currency.{" "}
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
                        value={formik.values.currency}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
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
                    {formik.touched.currency && formik.errors.currency ? (
                      <div className="text-sm text-red-600">
                        {formik.errors.currency}
                      </div>
                    ) : null}
                  </div>
                  <div className="sm:col-span-1">
                    <InputLabel
                      labelName={"interval"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          Specifies billing frequency. Either day, week, month
                          or year.{" "}
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
                    <InputLabel
                      labelName={"interval_count"}
                      tooltipContents={
                        <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	 after:contents-[''] after:absolute after:-bottom-1 after:left-0.5 after:rotate-45 after:w-3 after:h-3 after:drop-shadow-lg after:shadow-black	 after:bg-white after:-z-10 ">
                          The number of intervals between subscription billings.
                          For example, interval=month and interval_count=3 bills
                          every 3 months. Maximum of one year interval allowed
                          (1 year, 12 months, or 52 weeks).{" "}
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
