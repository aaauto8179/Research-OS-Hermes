"use client";

import GenericWidget from "./GenericWidget";

export default function CompanyInfo() {
  return <GenericWidget title="Company Info" description="Basic company information and details" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
