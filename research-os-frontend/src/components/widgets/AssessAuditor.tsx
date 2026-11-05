"use client";

import GenericWidget from "./GenericWidget";

export default function AssessAuditor() {
  return <GenericWidget title="Assess Auditor" description="Auditor quality assessment" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
