"use client";

import GenericWidget from "./GenericWidget";

export default function CustomerConcentration() {
  return <GenericWidget title="Customer Concentration" description="Customer concentration risk analysis" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
