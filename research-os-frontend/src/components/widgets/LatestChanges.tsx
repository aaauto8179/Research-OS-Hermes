"use client";

import GenericWidget from "./GenericWidget";

export default function LatestChanges() {
  return <GenericWidget title="Latest Changes" description="Text box with impact selector for recent events" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
