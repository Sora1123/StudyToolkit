"use client";

import DesmosCalculator from "@/app/components/Calculator/DesmosCalculator";

/**
 * Calculator module — reuses the existing Desmos calculator component.
 */
export default function CalculatorModule() {
  return (
    <div className="h-full min-h-[220px] w-full overflow-hidden rounded-md border border-line">
      <DesmosCalculator />
    </div>
  );
}
