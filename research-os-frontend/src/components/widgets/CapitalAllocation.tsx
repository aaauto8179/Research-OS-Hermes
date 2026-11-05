"use client";

import GenericWidget from "./GenericWidget";

export default function CapitalAllocation() {
  return <GenericWidget title="Capital Allocation" description="Capital allocation quality assessment" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
