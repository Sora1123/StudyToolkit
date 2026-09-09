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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let tasks = await readDb();

  tasks = tasks.filter((task: any) => task.id !== id);
  await writeDb(tasks);
  return NextResponse.json({ success: true });
}
