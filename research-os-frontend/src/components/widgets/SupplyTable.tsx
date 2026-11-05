"use client";

import GenericWidget from "./GenericWidget";

export default function SupplyTable() {
  return <GenericWidget title="Supply Table" description="Supply-side factors" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
