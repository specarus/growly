import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Link as LinkIcon } from "lucide-react";

const IntegrationWidget = () => {
  return (
    <div className="space-y-4 px-6">
      <Card className="flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-none">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div
            style={{ backgroundImage: "url('/spotify.png')" }}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cover bg-no-repeat bg-center"
          ></div>
        </div>

        <h3 className="font-semibold text-base sm:text-lg mb-2 text-center">
          Connect your <br />
          Spotify account
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 text-center">
          Empower yourself with habit tracking while enjoying uninterrupted
          music
        </p>

        <Button className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background h-10 sm:h-11 text-sm sm:text-base">
          <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Link Account
        </Button>
      </Card>
    </div>
  );
};

export default IntegrationWidget;
