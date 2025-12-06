"use client";

import Button from "@/app/components/ui/button";
import Image from "next/image";

type SyncWidgetProps = Record<string, never>;

const SyncWidget: React.FC<SyncWidgetProps> = () => {
  return (
    <div className="relative text-center lg:pt-16 xl:pt-20 text-foreground">
      <div className="absolute w-full z-0 lg:-top-8 xl:-top-10 2xl:top-[-60px] left-1/2 transform -translate-x-1/2">
        <div
          className="absolute m-auto rounded-full blur-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "70%",
            height: "70%",
            background:
              "radial-gradient(circle, rgba(255, 165, 0, 0.5) 0%, rgba(255, 69, 0, 0.1) 70%, transparent 100%)",
            zIndex: 0,
          }}
        ></div>

        <Image
          src="/mascot.png"
          width={1000}
          height={1000}
          alt="Mascot"
          className="lg:w-32 lg:h-32 xl:w-40 xl:h-40 2xl:w-48 2xl:h-48 mx-auto relative z-10 pointer-events-none select-none"
        />
      </div>

      <div className="flex flex-col justify-between shadow-sm shadow-primary/20 relative bg-light-yellow lg:p-6 2xl:p-4 rounded-2xl z-10 h-full dark:bg-slate-900 dark:shadow-none">
        <h3 className="font-semibold lg:text-sm xl:text-base 2xl:text-lg mb-1 text-foreground dark:text-white">
          Sync anywhere with <br />
          <span className="text-green-soft">Growly</span> Mobile App
        </h3>
        <p className="text-muted-foreground lg:text-[10px] xl:text-xs 2xl:text-sm dark:text-muted-foreground/80">
          Download now, sync later!
        </p>
        <Button className="shadow-sm bg-foreground hover:bg-foreground/90 text-background lg:h-7 xl:h-9 2xl:h-11 lg:text-xs xl:text-sm 2xl:text-base transition-all duration-100">
          Download App
        </Button>
      </div>
    </div>
  );
};

export default SyncWidget;
