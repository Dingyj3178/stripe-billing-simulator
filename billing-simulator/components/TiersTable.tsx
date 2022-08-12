import React from "react";
import InputLabel from "./InputLabel";
import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { Field, FieldArray } from "formik";

import { Parameters } from "../typings";

const TiersTable = ({
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
                    Each element represents a pricing tier. This parameter
                    requires billing_scheme to be set to tiered. See also the
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
                  arrayHelpers.insert(values.pricingTiers.length - 1, {
                    up_to:
                      Number(
                        values.pricingTiers[values.pricingTiers.length - 2]
                          .up_to
                      ) + 2,
                    unit_amount: 1000,
                    flat_amount: 0,
                  })
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
                              <span className="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {values.pricingTiers.map((tier, index) => (
                            <tr key={index}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {index + 1}
                              </td>
                              <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500">
                                <Field name={`pricingTiers.${index}.up_to`}>
                                  {({ field }: { field: any }) => (
                                    <div className=" relative group">
                                      <input
                                        className={
                                          errors &&
                                          errors.pricingTiers &&
                                          errors.pricingTiers[index] &&
                                          errors.pricingTiers[index].up_to &&
                                          touched &&
                                          touched.pricingTiers &&
                                          touched.pricingTiers[index] &&
                                          touched.pricingTiers[index].up_to
                                            ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                            : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        }
                                        type={
                                          index ===
                                          values.pricingTiers.length - 1
                                            ? "text"
                                            : "number"
                                        }
                                        disabled={
                                          index ===
                                          values.pricingTiers.length - 1
                                        }
                                        {...field}
                                      />
                                      {errors &&
                                        errors.pricingTiers &&
                                        errors.pricingTiers[index] &&
                                        errors.pricingTiers[index].up_to &&
                                        touched &&
                                        touched.pricingTiers &&
                                        touched.pricingTiers[index] &&
                                        touched.pricingTiers[index].up_to && (
                                          <div className="block">
                                            <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                              {errors.pricingTiers[index].up_to}
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </Field>
                              </td>
                              <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500 ">
                                <Field
                                  name={`pricingTiers.${index}.unit_amount`}
                                >
                                  {({ field }: { field: any }) => (
                                    <div className=" block relative group">
                                      <input
                                        className={
                                          errors &&
                                          errors.pricingTiers &&
                                          errors.pricingTiers[index] &&
                                          errors.pricingTiers[index]
                                            .unit_amount &&
                                          touched &&
                                          touched.pricingTiers &&
                                          touched.pricingTiers[index] &&
                                          touched.pricingTiers[index]
                                            .unit_amount
                                            ? "shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-500 rounded-md"
                                            : "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        }
                                        type="number"
                                        {...field}
                                      />
                                      {errors &&
                                        errors.pricingTiers &&
                                        errors.pricingTiers[index] &&
                                        errors.pricingTiers[index]
                                          .unit_amount &&
                                        touched &&
                                        touched.pricingTiers &&
                                        touched.pricingTiers[index] &&
                                        touched.pricingTiers[index]
                                          .unit_amount && (
                                          <div className="">
                                            <p className="text-red-600 before:contents-[''] before:absolute before:-bottom-3 before:left-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible parameter-tooltip  bg-white  p-2 text-sm inline-block   absolute bottom-12 shadow-lg	  ">
                                              {
                                                errors.pricingTiers[index]
                                                  .unit_amount
                                              }
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </Field>
                              </td>
                              <td className="whitespace-nowrap px-1 py-4 text-sm text-gray-500 group relative">
                                <Field
                                  name={`pricingTiers.${index}.flat_amount`}
                                >
                                  {({ field }: { field: any }) => (
                                    <div className=" ">
                                      <input
                                        className={
                                          errors &&
                                          errors.pricingTiers &&
                                          errors.pricingTiers[index] &&
                                          errors.pricingTiers[index]
                                            .flat_amount &&
                                          touched &&
                                          touched.pricingTiers &&
                                          touched.pricingTiers[index] &&
                                          touched.pricingTiers[index]
                                            .flat_amount
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
                                  errors.pricingTiers[index] &&
                                  errors.pricingTiers[index].flat_amount &&
                                  touched &&
                                  touched.pricingTiers &&
                                  touched.pricingTiers[index] &&
                                  touched.pricingTiers[index].flat_amount && (
                                    <div className="">
                                      <p className="text-red-600  before:contents-[''] before:absolute before:-bottom-3 before:right-0.5 before:w-5 before:h-5 before:hover:visible z-[99] hover:visible prose prose-sm prose-indigo rounded invisible group-hover:visible  bg-white  p-2 text-sm inline-block   absolute bottom-16 right-3 shadow-lg	 ">
                                        {errors.pricingTiers[index].flat_amount}
                                      </p>
                                    </div>
                                  )}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-1 pr-1 text-right text-sm font-medium sm:pr-6">
                                <button
                                  className="disabled:opacity-0"
                                  disabled={
                                    index === values.pricingTiers.length - 1 ||
                                    index === 0
                                  }
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
                errors.pricingTiers &&
                typeof errors.pricingTiers === "string" && (
                  <div className="text-sm text-red-600 mt-1">
                    {errors.pricingTiers}
                  </div>
                )}
            </div>
          </div>
        ) : null
      }
    />
  );
};

export default TiersTable;
