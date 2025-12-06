import Image from "next/image";

export default function PlantBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br from-white/90 via-light-yellow/80 to-green-soft/70 shadow-sm lg:p-4 xl:p-7 2xl:p-10">
      <div className="pointer-events-none absolute -top-6 right-6 h-32 w-32 rounded-full bg-primary/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 left-6 h-32 w-32 rounded-full bg-green-soft/40 blur-3xl" />
      <div className="relative z-10">
        <div className="lg:space-y-2 xl:space-y-3">
          <div className="lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-foreground">
            <div className="flex lg:pl-8 xl:pl-10 lg:pr-24 xl:pr-32 2xl:pr-36 justify-between">
              <div>Plant small</div>
              <div>wins,</div>
            </div>
            <div className="flex lg:pl-4 xl:pl-14 2xl:pl-4 xl:pr-8 2xl:pr-0 justify-between">
              <div>harvest</div>
              <div>momentum.</div>
            </div>
          </div>

          <div className="lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
            <div className="flex xl:pl-0 2xl:pl-2 justify-between">
              <div>Build a todo that </div>
              <div>feels effortless to start.</div>
            </div>
            <div className="flex lg:pl-2 xl:pl-0 2xl:pl-4 lg:pr-10 xl:pr-6 2xl:pr-12 justify-between">
              <div>The little wins you </div>
              <div>plant today grow</div>
            </div>
            <div className="flex lg:pl-8 2xl:pl-12 lg:pr-6 xl:pr-8 2xl:pr-6 justify-between">
              <div>routines that</div>
              <div>sustain tomorrow.</div>
            </div>
          </div>

          <div className="flex justify-between gap-2 lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold">
            <span className="rounded-full border border-white/60 bg-white/20 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 text-primary">
              Focused intake
            </span>
            <span className="rounded-full border border-white/40 bg-white/20 lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 text-muted-foreground">
              Momentum builder
            </span>
          </div>
        </div>
        <div className="absolute lg:-top-14 lg:-left-2 xl:top-[-52] 2xl:top-[-96] xl:left-[-12] w-full select-none pointer-events-none">
          <Image
            src="/plant.png"
            width={400}
            height={400}
            alt="Cheerful plant mascot ready for new todos"
            className="w-full h-full"
            priority
          />
        </div>
      </div>
    </div>
  );
}
