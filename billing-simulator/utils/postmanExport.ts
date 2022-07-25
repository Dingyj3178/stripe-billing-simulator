import addHours from "date-fns/addHours";
import { calculateUpdate } from "./timelineHelper";
import { Parameters } from "../typings";

function setPricingParameter(parameter: Parameters) {
  let parameters: [{ key: string; value: string; type: string } | string] = [
    { key: "", value: "", type: "" },
  ];
  parameters.push(
    {
      key: "currency",
      value: parameter.currency,
      type: "text",
    },

    parameter.tiers_mode === ""
      ? {
          key: "unit_amount",
          value: parameter.unit_amount.toString(),
          type: "text",
        }
      : "",
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
      value: parameter.interval_count.toString(),
      type: "text",
    },
    parameter.tiers_mode !== ""
      ? {
          key: "tiers_mode",
          value: parameter.tiers_mode,
          type: "text",
        }
      : "",

    parameter.tiers_mode !== ""
      ? {
          key: "billing_scheme",
          value: "tiered",
          type: "text",
        }
      : ""
  );

  if (parameter.tiers_mode !== "") {
    return parameters.concat(
      parameter.pricingTiers.flatMap((tier, index) => {
        return [
          {
            key: `tiers[${index}][up_to]`,
            value: tier.up_to.toString(),
            type: "text",
          },
          {
            key: `tiers[${index}][unit_amount]`,
            value: tier.unit_amount.toString(),
            type: "text",
          },
          {
            key: `tiers[${index}][flat_amount]`,
            value: tier.flat_amount.toString(),
            type: "text",
          },
        ];
      })
    );
  } else {
    return parameters;
  }
}

export const postmanExport = (parameter: Parameters) => {
  return JSON.stringify(
    {
      info: {
        _postman_id:
          "billing_simulator" + "_" + new Date().toISOString().slice(0, 19),
        name: `billing_simulator` + "_" + new Date().toISOString().slice(0, 19),
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
                  value: Math.floor(parameter.create_date.getTime() / 1000),
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
              urlencoded: setPricingParameter(parameter),
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
                      value: Math.floor(parameter.trial_end.getTime() / 1000),
                      type: "text",
                    }
                  : "",
                parameter.billing_cycle_anchor !== null
                  ? {
                      key: "billing_cycle_anchor",
                      value: Math.floor(
                        parameter.billing_cycle_anchor.getTime() / 1000
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
                      value: Math.floor(parameter.trial_end.getTime() / 1000),
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
                        ).getTime() / 1000
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
                    addHours(
                      calculateUpdate(
                        parameter.trial_end,
                        parameter.create_date,
                        parameter.interval,
                        parameter.interval_count
                      ),
                      1
                    ).getTime() / 1000
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
  );
};
