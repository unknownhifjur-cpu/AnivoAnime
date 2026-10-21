import { ChevronRight } from "lucide-react";

export default function SectionHeading({ icon: Icon, title, onViewAll }) {
  return (
    <div className="mb-3 flex items-center justify-between sm:mb-4">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white sm:text-base">
        <Icon size={15} className="text-lilac" />
        {title}
      </h2>
      <button
        className="flex items-center gap-1 text-[9px] text-lilac transition hover:text-white sm:text-[10px]"
        onClick={onViewAll}
        type="button"
      >
        View all <ChevronRight size={13} />
      </button>
    </div>
  );
}
