"use client";

import React, { useState } from "react";
// import { LatexInput } from "@latex-math/react";
import Link from "next/link";

import DesmosCalculator from "@/app/components/Calculator/DesmosCalculator";

export default function Calculator() {

  return (
    <>
      <DesmosCalculator />
      <Link href = "/">
        To Home
      </Link>
    </>
  );
}

