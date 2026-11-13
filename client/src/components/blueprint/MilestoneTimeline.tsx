import { MILESTONES } from '@client/src/data/project';
import { formatShortDate } from '@client/src/data/selectors';
import type { Milestone } from '@client/src/data/types';

interface MilestoneTimelineProps {
  milestones?: Milestone[];
}

const MilestoneTimeline = ({ milestones = MILESTONES }: MilestoneTimelineProps) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative flex min-w-max px-1">
        <div className="absolute left-0 right-0 top-11 h-px bg-slate-200" />
        {milestones.map((m: Milestone) => (
          <div
            key={`${m.date}-${m.name}`}
            className="group relative flex w-[124px] shrink-0 flex-col items-center px-1 text-center"
          >
            <div className="bp-kpi-label h-4 leading-4 text-[#0033A0]">
              {formatShortDate(m.date)}
            </div>
            <div className="mt-2 flex size-10 items-center justify-center rounded-full border border-border bg-white transition-colors group-hover:border-[#0033A0]">
              <span className="size-2 rounded-full bg-[#0033A0]" />
            </div>
            <div className="mt-2 max-w-[112px] text-[11px] font-bold leading-snug text-slate-800">
              {m.name}
            </div>
            <div className="mt-1 max-w-[112px] text-[9px] font-medium leading-snug text-[#94A3B8]">
              {m.nature}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { MilestoneTimeline };
