"use client";

import GenericWidget from "./GenericWidget";

export default function KeyFragilityPoints() {
  return <GenericWidget title="Key Fragility Points" description="Critical fragility points of the business" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
