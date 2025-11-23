import Image from "next/image";

export default function PlantBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-linear-to-br from-white/90 via-light-yellow/80 to-green-soft/70 shadow-sm p-10">
      <div className="pointer-events-none absolute -top-6 right-6 h-32 w-32 rounded-full bg-primary/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 left-6 h-32 w-32 rounded-full bg-green-soft/40 blur-3xl" />
      <div className="relative z-10">
        <div className="space-y-3">
          <div className="xl:text-xl 2xl:text-2xl font-bold text-foreground">
            <div className="flex pl-10 pr-28 justify-between">
              <div>Plant small</div>
              <div>wins,</div>
            </div>
            <div className="flex pl-4 justify-between">
              <div>harvest</div>
              <div>momentum.</div>
            </div>
          </div>

          <div className="xl:text-xs 2xl:text-sm text-muted-foreground leading-relaxed">
            <div className="flex pl-2 justify-between">
              <div>Build a todo that </div>
              <div>feels effortless to start.</div>
            </div>
            <div className="flex pl-4 pr-10 justify-between">
              <div>The little wins you </div>
              <div>plant today grow</div>
            </div>
            <div className="flex pl-12 pr-6 justify-between">
              <div>routines that</div>
              <div>sustain tomorrow.</div>
            </div>
          </div>

          <div className="flex justify-between gap-2 text-[11px] font-semibold">
            <span className="rounded-full border border-white/60 bg-white/20 px-3 py-1 text-primary">
              Focused intake
            </span>
            <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-muted-foreground">
              Momentum builder
            </span>
          </div>
        </div>
        <div className="absolute top-[-96] left-[-7] w-full select-none pointer-events-none">
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
