import { ORDER_STEPS } from "@/lib/order-process";

/** 7-step ordering timeline: vertical on mobile, horizontal on desktop. */
export function ProcessSteps() {
  return (
    <ol className="relative grid gap-6 lg:grid-cols-7 lg:gap-4">
      {/* Connector line: vertical on mobile, horizontal on desktop. */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-5 w-0.5 bg-gold-600/40 lg:top-5 lg:right-[7%] lg:bottom-auto lg:left-[7%] lg:h-0.5 lg:w-auto"
      />
      {ORDER_STEPS.map((step, index) => (
        <li
          key={step.title}
          className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center"
        >
          <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-600 font-heading text-lg font-bold text-stone-900">
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-semibold md:text-lg">{step.title}</h3>
            <p className="mt-1 text-small-responsive text-stone-700">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
