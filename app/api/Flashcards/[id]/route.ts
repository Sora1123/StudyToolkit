import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "public/Flashcard.json");

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

async function readDb(): Promise<Flashcard[]> {
  try {
    const result = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function writeDb(data: Flashcard[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cards = await readDb();
  const next = cards.filter((card) => card.id !== id);
  await writeDb(next);
  return NextResponse.json({ success: true });
}
