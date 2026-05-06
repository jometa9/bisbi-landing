import { Loader } from "lucide-react";

export function TableLoading() {
  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader className="h-6 w-6 text-gray-400  animate-spin" />
      </div>
    </div>
  );
}





