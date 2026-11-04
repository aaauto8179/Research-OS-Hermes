"use client";

import GenericWidget from "./GenericWidget";

export default function RegulationsWidget() {
  return <GenericWidget title="Regulations" description="Key regulatory changes and impacts" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
