"use client";

import GenericWidget from "./GenericWidget";

export default function DemandTable() {
  return <GenericWidget title="Demand Table" description="Top demand drivers and impact" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
