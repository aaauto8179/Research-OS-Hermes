"use client";

import GenericWidget from "./GenericWidget";

export default function CostBreakup() {
  return <GenericWidget title="Cost Breakup" description="Cost structure breakdown" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
