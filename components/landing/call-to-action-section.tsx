"use client";

import { Button } from "@/components/ui/button";

interface CallToActionSectionProps {
  onDownloadClick: () => void;
}

export function CallToActionSection({
  onDownloadClick,
}: CallToActionSectionProps) {
  const calculateYearsSince2018 = () => {
    const startDate = new Date(2018, 0, 1);
    const currentDate = new Date();
    const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff = currentDate.getMonth() - startDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < startDate.getDate())
    ) {
      return yearsDiff - 1;
    }
    return yearsDiff;
  };

  const yearsOfExperience = calculateYearsSince2018();

  return (
    <div className="max-w-5xl mx-auto px-3 flex flex-col items-center justify-center gap-3 text-balance py-34">
      <p className="text-gray-600 text-xl mb-1 text-center max-w-md text-wrap">
        {yearsOfExperience} {yearsOfExperience === 1 ? "year" : "years"} of
        experience{" "}
        <span className="block md:inline">on software industry</span>
      </p>
      <h2 className="md:text-7xl text-4xl text-gray-900 text-center mb-2 ">
        Start copying trades today.
      </h2>

      <Button
        type="button"
        onClick={onDownloadClick}
        className="mt-4 inline-flex items-center gap-3 rounded-full bg-black p-3  text-white transition-all duration-200 hover:bg-gray-600 text-lg"
      >
        Start copying now
      </Button>
    </div>
  );
}
