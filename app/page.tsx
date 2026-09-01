'use client'

import { useState, useEffect } from "react"; 
import Link from 'next/link';

export default function Home() {
  const [count, setCount] = useState<number>(0);
  
  function handleClick(){
    setCount(count+1);
  }

  return (
    <>
      <p className = "flex justify-center">{count}</p>
      <button onClick = {handleClick} className = "content-center">decrement</button>
      <Link className="flex justify-center" href='/pomodoro'>To Pomodoro Timer</Link>
    </>
  );
}

