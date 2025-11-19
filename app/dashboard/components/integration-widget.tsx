import Button from "@/app/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

const IntegrationWidget = () => {
  return (
    <div className="flex flex-col items-center xl:p-2 2xl:p-6 xl:rounded-2xl 2xl:rounded-3xl text-foreground">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div
          style={{ backgroundImage: "url('/spotify.png')" }}
          className="xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 rounded-full bg-cover bg-no-repeat bg-center"
        ></div>
      </div>

      <h3 className="font-semibold xl:text-base 2xl:text-lg mb-2 text-center">
        Connect your <br />
        Spotify account
      </h3>

      <p className="xl:text-xs 2xl:text-sm text-muted-foreground xl:mb-3 2xl:mb-4 text-center">
        Empower yourself with habit tracking while enjoying uninterrupted music
      </p>

      <Button className="bg-foreground hover:bg-foreground/90 text-background xl:h-9 2xl:h-11 xl:text-sm 2xl:text-base transition-all duration-100">
        <LinkIcon className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-2" />
        Link Account
      </Button>
    </div>
  );
};

export default IntegrationWidget;
