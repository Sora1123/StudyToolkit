'use client'

import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Link className="flex justify-center" href='/Pomodoro'>To Pomodoro Timer</Link>
      <Link className="flex justify-center" href='/Flashcard'>To Flashcard</Link>
    </>
  );
}

