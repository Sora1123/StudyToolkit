"use client";

import dynamic from "next/dynamic";

import { useState, useEffect } from "react";
import { evaluate } from "mathjs";
import { MathField } from "react-mathquill";
import { evaluateTex } from "tex-math-parser";

const EditableMathField = dynamic(
  () => import("react-mathquill").then((mod) => mod.EditableMathField),
  { ssr: false },
);

export default function Calculator() {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    import("react-mathquill").then((mq) => {
      mq.addStyles();
    });
  }, []);

  const handleCalculate = () => {
    try {
      const output = evaluateTex(expression);
      setAnswer(output.evaluated);
    } catch (e) {
      setAnswer("Invalid expression");
      console.log(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    try {
      if (e.key === "Enter") {
        console.log(expression);
        e.preventDefault();
        handleCalculate();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleMathChange = (mathField) => {
    const currentLatex = mathField.latex();
    setExpression(currentLatex);
  };

  return (
    <div className="caret-red-500">
      <form className="bg-slate-700">
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="border-1"
          onKeyDown={handleKeyDown}
        />
      </form>
      <div className="bg-amber-100">
        <EditableMathField
          latex={expression}
          onChange={handleMathChange}
          onKeyDown={handleKeyDown}
          config={{ autoCommands: "sqrt" }}
          className="caret-red-500 text-blue-600"
        />
        <p className="text-blue-600">{answer}</p>
      </div>
    </div>
  );
}
