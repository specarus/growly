import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import mascotImage from "@/assets/mascot.png";

const SyncWidget = () => {
  return (
    <Card className="relative border-0 text-center pt-20 shadow-none">
      <div className="absolute w-full z-0 xl:top-[-40px] 2xl:top-[-60px] left-1/2 transform -translate-x-1/2">
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

        <img
          src={mascotImage}
          alt="Mascot"
          className="xl:w-40 xl:h-40 2xl:w-48 2xl:h-48 mx-auto relative z-10 pointer-events-none"
        />
      </div>

      <div className="flex flex-col justify-between relative inset-0 bg-[#fefbee] xl:p-6 2xl:p-4 rounded-2xl z-10 h-full">
        <h3 className="font-semibold xl:text-base 2xl:text-lg mb-1">
          Sync anywhere with <br />
          <span className="text-green-soft">Growly</span> Mobile App
        </h3>
        <p className="text-muted-foreground xl:text-xs 2xl:text-sm mb-3 sm:mb-4">
          Download now, sync later!
        </p>
        <Button className="w-full rounded-full bg-white shadow-sm border-[1px] border-gray-50 hover:bg-primary hover:text-white text-foreground xl:h-9 2xl:h-11 xl:text-sm 2xl:text-base">
          Download App
        </Button>
      </div>
    </Card>
  );
};

export default SyncWidget;
