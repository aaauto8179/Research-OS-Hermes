"use client";

import GenericWidget from "./GenericWidget";

export default function DecisionTerminal() {
  return <GenericWidget title="Decision Terminal" description="Tag conviction based on 3 parameters" columns={['Item', 'Details', 'Impact', 'Notes']} />;
}
