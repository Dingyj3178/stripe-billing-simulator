export {};

declare global {
  interface Window {
    gtag?: any;
  }
}

export type pricingTiers = {
  up_to: string | number;
  unit_amount: number;
  flat_amount: number;
};

export type usageRecord = {
  quantity: number;
  action: "set" | "increment";
  timestamp: number | "now";
};

export type Parameters = {
  create_date: Date | null;
  interval: string;
  interval_count: number;
  billing_cycle_anchor: Date | null;
  trial_end: Date | null;
  proration_behavior: string;
  unit_amount: number;
  currency: string;
  usage_type: string;
  tiers_mode: string;
  aggregate_usage: string;
  pricingTiers: pricingTiers[];
  usageRecord: usageRecord[];
};

export type EventResult = {
  timeline: number;
  updatePoint: number;
  startPoint: number;
  billingPoint: number;
  trialEndPoint: number;
};
