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

export async function GET() {
  const tasks = await readDb();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();

  const tasks = await readDb();
  const newTask: Task = {
    id: Date.now().toString(),
    task: body.task,
  };

  tasks.push(newTask);
  await writeDb(tasks);

  return NextResponse.json(newTask, { status: 201 });
}
