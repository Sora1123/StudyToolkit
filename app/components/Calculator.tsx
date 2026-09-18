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
    //   console.log(evaluateTex("\\sum_{n=1}^{20}n").evaluated)
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

  const handleMathChange = (mathField: any) => {
    const currentLatex = mathField.latex();
    setExpression(currentLatex);
  };

  return (
    <>
      <EditableMathField
        latex={expression}
        onChange={handleMathChange}
        onKeyDown={handleKeyDown}
        config={{ autoCommands: "sqrt" }}
        className="[&_.mq-cursor]:!border-l-red-500 text-blue-100 border-1"
      />
      <p className="text-blue-600">{answer}</p>
    </>
  );
}
