import Link from "next/link";
import Timer from "./components/Timer";
import Flashcard from "./components/Flashcard/Flashcard";
import ToDo from "./components/ToDo";
import DraggableItem from "./components/DraggableItem";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <DraggableItem defaultPos={{ x: 50, y: 50 }} defaultSize={{ width: 300, height: 250 }}>
        <div className="flex flex-col items-center gap-2 h-full">
          <Link className="text-blue-400 hover:underline" href="/Pomodoro">
            To Pomodoro Timer
          </Link>
          <Timer />
        </div>
      </DraggableItem>

      <DraggableItem defaultPos={{ x: 380, y: 50 }} defaultSize={{ width: 350, height: 300 }}>
        <div className="flex flex-col items-center gap-2 h-full">
          <Link className="text-blue-400 hover:underline" href="/Flashcard">
            To Flashcard
          </Link>
          <Flashcard />
        </div>
      </DraggableItem>

      <DraggableItem defaultPos={{ x: 760, y: 50 }} defaultSize={{ width: 320, height: 400 }}>
        <div className="flex flex-col items-center gap-2 h-full">
          <Link className="text-blue-400 hover:underline" href="/ToDo">
            To ToDo
          </Link>
          <ToDo />
        </div>
      </DraggableItem>
    </main>
  );
}