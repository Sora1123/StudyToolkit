import Link from "next/link";
import Timer from "./components/Timer";
import Flashcard from "./components/Flashcard/Flashcard";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <Link className="flex justify-center" href="/Pomodoro">
          To Pomodoro Timer
        </Link>
        <Timer />
      </div>
      <div className="flex flex-col items-center gap-6">
        <Link className="flex justify-center" href="/Flashcard">
          To Flashcard
        </Link>
        <Flashcard />
      </div>
    </>
  );
}
