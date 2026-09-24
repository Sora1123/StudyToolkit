import ToDo from "@/app/components/ToDo";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Tasks" description="Everything on your plate." />
      <div className="flex flex-1 justify-center p-6">
        <ToDo />
      </div>
    </div>
  );
}
