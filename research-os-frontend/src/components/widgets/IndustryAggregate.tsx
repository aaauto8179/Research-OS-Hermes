"use client";

import GenericWidget from "./GenericWidget";

export default function IndustryAggregate() {
  return <GenericWidget title="Industry Aggregate" description="Industry-level aggregate metrics" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
