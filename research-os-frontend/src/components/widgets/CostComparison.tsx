"use client";

import GenericWidget from "./GenericWidget";

export default function CostComparison() {
  return <GenericWidget title="Cost Comparison" description="Cost comparison across peers" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
