import React from "react";
import InputLabel from "./InputLabel";
import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { Field, FieldArray } from "formik";

import addYears from "date-fns/addYears";
import addMonths from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addDays from "date-fns/addDays";

import { Parameters } from "../typings";

const MetersTable = ({
  values,
  errors,
  touched,
}: {
  values: Parameters;
  errors: any;
  touched: any;
}) => {
  return (
    <FieldArray
      name="usageRecord"
      render={(arrayHelpers) => (
        <div className="sm:col-span-2">
          <div className="flex justify-between">
            <InputLabel
              labelName={"Usage Records"}
              tooltipContents={
                <p className="before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99]  hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block w-52   absolute bottom-[22px] shadow-lg	  ">
                  Usage records allow you to report customer usage and metrics
                  to Stripe for metered billing of subscription prices.{" "}
                  <a
                    href="https://stripe.com/docs/api/usage_records"
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
              className={
                values.usageRecord.length < 10
                  ? " inline-flex text-sm font-medium text-indigo-500 items-center"
                  : " inline-flex text-sm font-medium text-gray-500 items-center"
              }
              disabled={values.usageRecord.length >= 10}
              onClick={() => {
                const endDate =
                  values.trial_end !== null
                    ? values.trial_end
                    : values.create_date;
                const updateDate =
                  values.interval === "year"
                    ? addYears(
                        new Date(endDate as Date),
                        values.interval_count * values.usageRecord.length
                      )
                    : values.interval === "month"
                    ? addMonths(
                        new Date(endDate as Date),
                        values.interval_count * values.usageRecord.length
                      )
                    : values.interval === "week"
                    ? addWeeks(
                        new Date(endDate as Date),
                        values.interval_count * values.usageRecord.length
                      )
                    : addDays(
                        new Date(endDate as Date),
                        values.interval_count * values.usageRecord.length
                      );

                arrayHelpers.insert(values.usageRecord.length, {
                  quantity: 1,
                  action: "increment",
                  timestamp: Math.floor(updateDate!.getTime() / 1000),
                });
              }}
            >
              <PlusIcon
                className={
                  values.usageRecord.length < 10
                    ? "w-4 h-4 text-indigo-500"
                    : "w-4 h-4 text-gray-500"
                }
              />
              add usage record
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
                            className="px-1 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            quality
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:pr-12"
                          >
                            action
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 "
                          >
                            timestamp
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                          >
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {values.usageRecord.map((record, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500">
                              <Field name={`usageRecord.${index}.quantity`}>
                                {({ field }: { field: any }) => (
                                  <div className=" relative group">
                                    <input
                                      className={
                                        errors &&
                                        errors.usageRecord &&
                                        errors.usageRecord[index] &&
                                        errors.usageRecord[index].quantity &&
                                        touched &&
                                        touched.usageRecord &&
                                        touched.usageRecord[index] &&
                                        touched.usageRecord[index].quantity
                                          ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                          : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      }
                                      type={"number"}
                                      {...field}
                                    />
                                    {errors &&
                                      errors.usageRecord &&
                                      errors.usageRecord[index] &&
                                      errors.usageRecord[index].quantity &&
                                      touched &&
                                      touched.usageRecord &&
                                      touched.usageRecord[index] &&
                                      touched.usageRecord[index].quantity && (
                                        <div className="block">
                                          <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                            {errors.usageRecord[index].quantity}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </Field>
                            </td>
                            <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500">
                              <Field name={`usageRecord.${index}.action`}>
                                {({ field }: { field: any }) => (
                                  <div className="w-18 block relative group">
                                    <select
                                      className={
                                        errors &&
                                        errors.usageRecord &&
                                        errors.usageRecord[index] &&
                                        errors.usageRecord[index].action &&
                                        touched &&
                                        touched.usageRecord &&
                                        touched.usageRecord[index] &&
                                        touched.usageRecord[index].action
                                          ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                          : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      }
                                      type="text"
                                      {...field}
                                    >
                                      <option value={"increment"}>incr</option>
                                      <option value={"set"}>set</option>
                                    </select>
                                    {errors &&
                                      errors.usageRecord &&
                                      errors.usageRecord[index] &&
                                      errors.usageRecord[index].action &&
                                      touched &&
                                      touched.usageRecord &&
                                      touched.usageRecord[index] &&
                                      touched.usageRecord[index]
                                        .unit_amount && (
                                        <div className="">
                                          <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                            {errors.usageRecord[index].action}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </Field>
                            </td>
                            <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500 group relative">
                              <Field name={`usageRecord.${index}.timestamp`}>
                                {({ field }: { field: any }) => (
                                  <div className="w-32 ">
                                    <input
                                      className={
                                        errors &&
                                        errors.usageRecord &&
                                        errors.usageRecord[index] &&
                                        errors.usageRecord[index].timestamp &&
                                        touched &&
                                        touched.usageRecord &&
                                        touched.usageRecord[index] &&
                                        touched.usageRecord[index].timestamp
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
                                errors.usageRecord &&
                                errors.usageRecord[index] &&
                                errors.usageRecord[index].timestamp &&
                                touched &&
                                touched.usageRecord &&
                                touched.usageRecord[index] &&
                                touched.usageRecord[index].timestamp && (
                                  <div className="">
                                    <p className="text-red-600  before:contents-[''] before:absolute before:-bottom-3 before:right-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible  bg-white  p-2 text-sm inline-block   absolute bottom-16 right-3 shadow-lg	 ">
                                      {errors.usageRecord[index].timestamp}
                                    </p>
                                  </div>
                                )}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-1 pr-1 text-right text-sm font-medium sm:pr-6">
                              <button
                                className="disabled:opacity-0"
                                disabled={index === 0}
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <XIcon className="w-4 h-4 text-indigo-500 " />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {errors &&
              errors.usageRecord &&
              typeof errors.usageRecord === "string" && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.usageRecord}
                </div>
              )}
          </div>
        </div>
      )}
    />
  );
};

export default MetersTable;
