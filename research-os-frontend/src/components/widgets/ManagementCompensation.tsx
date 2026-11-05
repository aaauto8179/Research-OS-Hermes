"use client";

import GenericWidget from "./GenericWidget";

export default function ManagementCompensation() {
  return <GenericWidget title="Management Compensation" description="Management compensation & benefits analysis" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
