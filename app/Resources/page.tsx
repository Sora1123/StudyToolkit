import ResourcesModule from "@/app/components/modules/ResourcesModule";
import DriveModule from "@/app/components/modules/DriveModule";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Resources"
        description="Jump back into recent materials, or open files from Google Drive."
      />
      <div className="flex flex-1 justify-center p-6">
        <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
          <section className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-text">Recent</h2>
            <div className="min-h-[16rem] flex-1">
              <ResourcesModule />
            </div>
          </section>
          <section className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-text">Google Drive</h2>
            <div className="min-h-[16rem] flex-1">
              <DriveModule />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
