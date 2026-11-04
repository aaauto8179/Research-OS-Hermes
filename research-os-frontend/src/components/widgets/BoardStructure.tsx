"use client";

import GenericWidget from "./GenericWidget";

export default function BoardStructure() {
  return <GenericWidget title="Board Structure" description="Board composition and governance" columns={[' + ', '.join(repr(c) for c in cols) + ']} />;
}
