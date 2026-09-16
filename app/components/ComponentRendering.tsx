import DraggableItem from "@/app/components/DraggableItem";
import Link from "next/link";

export default function ComponentRendering({
  children,
  defaultPos = { x: 50, y: 50 },
  defaultSize = { width: 300, height: 250 },
  appName,
}) {
  const targetHref = "/" + appName.replace(" ", "");

  return (
    <>
      <DraggableItem defaultPos={defaultPos} defaultSize={defaultSize}>
        <div className="flex flex-col items-center gap-2 h-full">
          <Link className="text-blue-400 hover:underline" href={targetHref}>
            To {appName}
          </Link>
          {children}
        </div>
      </DraggableItem>
    </>
  );
}
