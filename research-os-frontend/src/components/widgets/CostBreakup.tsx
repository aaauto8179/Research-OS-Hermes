"use client";

import GenericWidget from "./GenericWidget";

export default function CostBreakup() {
  return (
    <GenericWidget
      title="Cost Breakup"
      description="Cost structure breakdown across key operating expense heads"
      columns={["Expense Head", "Amount (₹ Cr)", "% of Revenue", "YoY Growth %", "Remarks"]}
      defaultRows={[
        ["Raw Materials & Feedstock", "4,82,100", "49.4%", "+8.2%", "Crude & polymer feed"],
        ["Employee Benefit Expenses", "28,450", "2.9%", "+12.1%", "Retail & tech hiring"],
        ["Power & Fuel", "32,800", "3.4%", "-2.5%", "Captive power optimization"],
        ["Other Operating Expenses", "76,920", "7.9%", "+6.4%", "Freight, maintenance & SG&A"],
      ]}
    />
  );
}
