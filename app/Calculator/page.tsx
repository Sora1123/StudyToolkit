import Calculator from "@/app/components/Calculator/Calculator";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Calculator"
        description="Graph and compute with Desmos."
      />
      <div className="flex-1 p-4 sm:p-6">
        <div className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-lg border border-line">
          <Calculator />
        </div>
      </div>
    </div>
  );
}
