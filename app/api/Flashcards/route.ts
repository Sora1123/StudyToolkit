import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "public/data.json");

// Simple helper to read DB
async function readDb() {
  try {
    const result = await fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(result);
  } catch (e) {
    return [];
  }
};

// Simple helper to write DB
async function writeDb (data: any) {
  await fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
};

// API Routes
export async function GET() {
  const cards = await readDb();
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const body = await request.json();

  const cards = await readDb();
  const newCard = {
    id: Date.now().toString(),
    front: body.front,
    back: body.back,
  };

  cards.push(newCard);
  await writeDb(cards);

  return NextResponse.json(newCard, { status: 201});
}

// app.delete("/api/cards/:id", (req, res) => {
//   let cards = readDb();
//   cards = cards.filter((card: any) => card.id !== req.params.id);
//   writeDb(cards);
//   res.json({ success: true });
// });
