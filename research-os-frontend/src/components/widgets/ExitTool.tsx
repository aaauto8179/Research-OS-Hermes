"use client";

import GenericWidget from "./GenericWidget";

export default function ExitTool() {
  return <GenericWidget title="Exit Tool" description="Exit triggers and review conditions" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
