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

export async function GET() {
  const cards = await readDb();
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const body = await request.json();

  const cards = await readDb();
  const newCard: Flashcard = {
    id: Date.now().toString(),
    front: body.front,
    back: body.back,
  };

  cards.push(newCard);
  await writeDb(cards);

  return NextResponse.json(newCard, { status: 201 });
}
