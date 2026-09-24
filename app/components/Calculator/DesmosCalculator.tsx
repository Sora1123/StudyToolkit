"use client";

import { useEffect, useRef } from "react";

// Minimal typing for the Desmos global loaded at runtime.
declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        options?: Record<string, unknown>,
      ) => { setExpression: (e: Record<string, unknown>) => void };
    };
  }
}

const API_KEY =
  process.env.NEXT_PUBLIC_DESMOS_API_KEY ?? "c53983518e974e1084a37da882a6ec28";

export default function DesmosCalculator() {
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calculatorRef.current) return;

    const script = document.createElement("script");
    script.src = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${API_KEY}`;
    script.async = true;

    script.onload = () => {
      if (!calculatorRef.current || !window.Desmos) return;

      const calculator = window.Desmos.GraphingCalculator(
        calculatorRef.current,
        {
          expressions: true,
          settingsMenu: true,
        },
      );

      calculator.setExpression({
        id: "graph1",
        latex: "y=x^2",
      });
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return <div ref={calculatorRef} className="h-full min-h-[300px] w-full" />;
}
