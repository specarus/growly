import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import mascotImage from "@/assets/mascot.png";

const SyncWidget = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-0 shadow-sm text-center">
        <div className="relative w-fit mx-auto">
          <div
            className="absolute inset-0 m-auto rounded-full blur-xl"
            style={{
              width: "100%",
              height: "70%",
              background:
                "radial-gradient(circle, rgba(255, 165, 0, 0.5) 0%, rgba(255, 69, 0, 0.1) 70%, transparent 100%)",
              zIndex: 0,
            }}
          ></div>

          <img
            src={mascotImage}
            alt="Mascot"
            className="w-24 h-24 sm:w-48 sm:h-48 mx-auto relative z-10 pointer-events-none"
          />
        </div>

        <h3 className="font-semibold text-base sm:text-lg mb-1">
          Sync anywhere with <br /> Growly Mobile App
        </h3>
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
          Download now, sync later!
        </p>
        <Button className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 sm:h-11 text-sm sm:text-base">
          Download App
        </Button>
      </Card>
    </div>
  );
};

export default SyncWidget;
