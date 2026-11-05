"use client";

import GenericWidget from "./GenericWidget";

export default function DemandTable() {
  return <GenericWidget title="Demand Table" description="Top demand drivers and impact" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
