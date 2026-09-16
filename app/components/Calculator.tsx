"use client";

import { useRef } from "react";


export default function Calculator() {
    const number = useRef();

  return <>
    <textarea ref = {number}/>
  </>;
}
