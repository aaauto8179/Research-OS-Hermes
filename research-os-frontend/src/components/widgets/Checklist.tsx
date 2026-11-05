"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const initialItems = [
  { id: "1", label: "Business model understood", checked: true },
  { id: "2", label: "Management quality verified", checked: true },
  { id: "3", label: "Financials audited (3 years)", checked: true },
  { id: "4", label: "Valuation within margin of safety", checked: false },
  { id: "5", label: "Risk factors catalogued", checked: false },
  { id: "6", label: "Exit triggers defined", checked: false },
];

export default function Checklist() {
  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Investment Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => toggleItem(item.id)}
            >
              <Checkbox
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
              />
              <span
                className={`text-sm transition-colors ${
                  item.checked ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
