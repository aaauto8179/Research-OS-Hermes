"use client";

import GenericWidget from "./GenericWidget";

export default function SegmentBreakup() {
  return (
    <GenericWidget
      title="Segment Breakup"
      description="Revenue and profitability breakdown by business segment"
      columns={["Segment", "Revenue (₹ Cr)", "EBITDA (₹ Cr)", "Margin %", "Contribution %"]}
      defaultRows={[
        ["Oil to Chemicals (O2C)", "5,64,320", "52,410", "9.3%", "57.8%"],
        ["Retail", "3,06,786", "23,114", "7.5%", "31.4%"],
        ["Digital Services (Jio)", "1,09,558", "54,230", "49.5%", "11.2%"],
        ["Oil & Gas (Upstream)", "24,850", "18,630", "75.0%", "2.5%"],
        ["Others & Unallocated", "12,410", "1,860", "15.0%", "1.3%"],
      ]}
    />
  );
}
