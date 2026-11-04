"use client";

import GenericWidget from "./GenericWidget";

export default function SupplyTable() {
  return <GenericWidget title="Supply Table" description="Supply-side factors" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
