"use client";

import GenericWidget from "./GenericWidget";

export default function WCBreakup() {
  return (
    <GenericWidget
      title="Working Capital Breakup"
      description="Working capital cycle components and days"
      columns={["Component", "Amount (₹ Cr)", "Days Sales / Purchases", "Trend", "Notes"]}
      defaultRows={[
        ["Inventories", "1,41,200", "53 days", "Improving", "Refinery inventory + retail stock"],
        ["Trade Receivables", "24,800", "9 days", "Stable", "Strict credit terms across B2B"],
        ["Trade Payables", "1,78,500", "67 days", "Favorable", "Strong bargaining power with vendors"],
        ["Net Working Capital", "-12,500", "-5 days", "Negative NWC", "Working capital funded by trade credit"],
      ]}
    />
  );
}
