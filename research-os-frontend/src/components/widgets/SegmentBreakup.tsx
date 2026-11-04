"use client";

import GenericWidget from "./GenericWidget";

export default function SegmentBreakup() {
  return <GenericWidget title="Segment Breakup" description="Revenue/cost breakup by segment" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
