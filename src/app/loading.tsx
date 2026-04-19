import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-card flex w-full max-w-sm flex-col items-center gap-4 rounded-[2rem] border p-10 text-center">
        <Loader label="Preparando seu painel" />
      </div>
    </div>
  );
}
