import NotesModule from "@/app/components/modules/NotesModule";
import PageHeader from "@/app/components/ui/PageHeader";

export default function Page() {
  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Notes"
        description="Write Markdown and LaTeX with a live, auto-compiling preview."
      />
      <div className="flex flex-1 justify-center p-6">
        {/* Give the notes editor room to breathe on a full page. */}
        <div className="flex h-[70vh] w-full max-w-4xl flex-col rounded-lg border border-line bg-surface p-4 shadow-sm">
          <NotesModule />
        </div>
      </div>
    </div>
  );
}
