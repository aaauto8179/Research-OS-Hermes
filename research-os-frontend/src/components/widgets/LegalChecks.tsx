"use client";

import GenericWidget from "./GenericWidget";

export default function LegalChecks() {
  return <GenericWidget title="Legal Checks & Contingent Liability" description="Legal and contingent liability assessment" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
