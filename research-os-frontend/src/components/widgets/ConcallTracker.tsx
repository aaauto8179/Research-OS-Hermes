"use client";

import GenericWidget from "./GenericWidget";

export default function ConcallTracker() {
  return <GenericWidget title="Concall Tracker" description="Track concall events and key takeaways" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
