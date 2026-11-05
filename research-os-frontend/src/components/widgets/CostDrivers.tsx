"use client";

import GenericWidget from "./GenericWidget";

export default function CostDrivers() {
  return <GenericWidget title="Cost Drivers" description="Important cost drivers" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
