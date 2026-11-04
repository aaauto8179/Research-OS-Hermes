"use client";

import GenericWidget from "./GenericWidget";

export default function WCBreakup() {
  return <GenericWidget title="Working Capital Breakup" description="Working capital components" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
