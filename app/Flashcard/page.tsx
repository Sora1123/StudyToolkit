'use client'

import { useState } from 'react';
import Flashcard from "@/app/components/Flashcard"
import Link from 'next/link';


export default function Home() {
  return (
    <>
      <Flashcard />
      <Link href='/'>To home</Link>
    </>
  );
}
