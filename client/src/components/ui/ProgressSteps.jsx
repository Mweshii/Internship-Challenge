// The row of circles on the tracking page: done steps get a green tick, the
// current step is blue, future steps are grey.
import { Check } from 'lucide-react';

export function ProgressSteps({ steps, currentStep }) {
  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        let circleClass = 'border-slate-300 bg-white text-slate-400';
        if (isDone) circleClass = 'border-emerald-500 bg-emerald-500 text-white';
        if (isCurrent) circleClass = 'border-brand-500 bg-brand-500 text-white ring-4 ring-brand-100';

        return (
          <li key={step} className="relative flex flex-1 flex-col items-center" aria-current={isCurrent ? 'step' : undefined}>
            {/* The line to the next circle, drawn behind the circles. */}
            {!isLast && (
              <span className={`absolute top-3.5 left-1/2 h-0.5 w-full ${isDone ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden="true" />
            )}
            <span className={`relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold ${circleClass}`}>
              {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className={`mt-2 px-1 text-center text-xs ${isCurrent ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
