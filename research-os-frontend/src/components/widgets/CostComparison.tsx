"use client";

import GenericWidget from "./GenericWidget";

export default function CostComparison() {
  return <GenericWidget title="Cost Comparison" description="Cost comparison across peers" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
