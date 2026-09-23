"use client";

import { useEffect, useRef } from "react";

export default function DesmosCalculator() {
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calculatorRef.current) return;

    const script = document.createElement("script");
    script.src = "https://www.desmos.com/api/v1.11/calculator.js?apiKey=c53983518e974e1084a37da882a6ec28";
    script.async = true;

    script.onload = () => {
      if (!calculatorRef.current) return;

      const calculator = window.Desmos.GraphingCalculator(
        calculatorRef.current,
        {
          expressions: true,
          settingsMenu: true,
        }
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

  return (
    <div
      ref={calculatorRef}
      style={{
        width: "100%",
        height: "300px",
      }}
    />
  );
}