'use client'

import { useState } from 'react';
import Timer from "@/app/components/Timer"
import Link from 'next/link';


export default function Home() {
  const [count, setCount] = useState<number>(0);
  
  function handleClick(){
    setCount(count-1);
  }

  return (
    <>
      <Timer />
      <Link href='/'>To home</Link>
    </>
  );
}
