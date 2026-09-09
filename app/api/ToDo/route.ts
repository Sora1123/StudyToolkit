import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "public/ToDo.json");

// Simple helper to read DB
async function readDb() {
  try {
    const result = await fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(result);
  } catch (e) {
    return [];
  }
}

// Simple helper to write DB
async function writeDb(data: any) {
  await fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

// API Routes
export async function GET() {
  const tasks = await readDb();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();

  const tasks = await readDb();
  const newTask = {
    id: Date.now().toString(),
    task: body.task,
  };

  tasks.push(newTask);
  await writeDb(tasks);

  return NextResponse.json(newTask, { status: 201 });
}
