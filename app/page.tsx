import Timer from "./components/Timer";
import Flashcard from "./components/Flashcard/Flashcard";
import ToDo from "./components/ToDo";
import ComponentRendering from "./components/ComponentRendering";
import Calculator from "./components/Calculator";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <ComponentRendering
        defaultPos={{ x: 50, y: 50 }}
        defaultSize={{ width: 300, height: 250 }}
        appName={"Pomodoro Timer"}
      >
        <Timer />
      </ComponentRendering>
      <ComponentRendering
        defaultPos={{ x: 380, y: 50 }}
        defaultSize={{ width: 350, height: 300 }}
        appName={"Flashcard"}
      >
        <Flashcard />
      </ComponentRendering>
      <ComponentRendering
        defaultPos={{ x: 760, y: 50 }}
        defaultSize={{ width: 320, height: 400 }}
        appName={"ToDo"}
      >
        <ToDo />
      </ComponentRendering>
      <ComponentRendering
        defaultPos={{ x: 50, y: 450 }}
        defaultSize={{ width: 320, height: 400 }}
        appName={"Calculator"}
      >
        <Calculator />
      </ComponentRendering>
    </main>
  );
}
