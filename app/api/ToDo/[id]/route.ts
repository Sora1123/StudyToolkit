import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "public/ToDo.json");

interface Task {
  id: string;
  task: string;
}

async function readDb(): Promise<Task[]> {
  try {
    const result = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function writeDb(data: Task[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tasks = await readDb();
  const next = tasks.filter((task) => task.id !== id);
  await writeDb(next);
  return NextResponse.json({ success: true });
}
