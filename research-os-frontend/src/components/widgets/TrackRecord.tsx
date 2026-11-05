"use client";

import GenericWidget from "./GenericWidget";

export default function TrackRecord() {
  return <GenericWidget title="Track Record" description="Historical milestones and performance" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
