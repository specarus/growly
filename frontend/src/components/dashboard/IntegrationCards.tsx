import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Link as LinkIcon } from "lucide-react";

const IntegrationCards = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>

        <h3 className="font-semibold text-base sm:text-lg mb-2">
          Connect your <br />
          Spotify account
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Empower yourself with habit tracking while enjoying uninterrupted
          music
        </p>

        <Button className="w-full rounded-xl bg-foreground hover:bg-foreground/90 text-background h-10 sm:h-11 text-sm sm:text-base">
          <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Link Account
        </Button>
      </Card>

      <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm bg-coral text-coral-foreground">
        <h3 className="font-semibold text-xl sm:text-2xl mb-1">More Integrations</h3>
        <p className="text-xs sm:text-sm opacity-90">23+ apps</p>
      </Card>
    </div>
  );
};

export default IntegrationCards;
