"use client";

import GenericWidget from "./GenericWidget";

export default function CostDrivers() {
  return <GenericWidget title="Cost Drivers" description="Important cost drivers" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
