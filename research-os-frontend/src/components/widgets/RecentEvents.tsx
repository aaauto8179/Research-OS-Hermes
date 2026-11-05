"use client";

import GenericWidget from "./GenericWidget";

export default function RecentEvents() {
  return <GenericWidget title="Recent Events" description="Track latest events (M&A, spinoffs, etc.)" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
