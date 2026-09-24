import Timer from "@/app/components/Timer";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Pomodoro Timer"
        description="Focus in timed study and rest intervals."
      />
      <div className="flex flex-1 items-center justify-center p-6">
        <Timer />
      </div>
    </div>
  );
}
