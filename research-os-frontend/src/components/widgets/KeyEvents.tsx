"use client";

import GenericWidget from "./GenericWidget";

export default function KeyEvents() {
  return <GenericWidget title="Key Events" description="Key corporate events tracker" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
