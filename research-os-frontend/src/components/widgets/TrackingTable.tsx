"use client";

import GenericWidget from "./GenericWidget";

export default function TrackingTable() {
  return <GenericWidget title="Tracking Table" description="Track key factors determining investment decision" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
