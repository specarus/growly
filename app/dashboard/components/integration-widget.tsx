import Button from "@/app/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

const IntegrationWidget = () => {
  return (
    <div className="flex flex-col items-center lg:px-8 lg:py-4 xl:px-6 xl:py-6 lg:rounded-xl xl:rounded-2xl 2xl:rounded-3xl text-foreground">
      <div className="flex items-start justify-between lg:mb-2 xl:mb-4">
        <div
          style={{ backgroundImage: "url('/spotify.png')" }}
          className="lg:w-8 lg:h-8  xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 rounded-full bg-cover bg-no-repeat bg-center"
        ></div>
      </div>

      <h3 className="font-semibold lg:text-sm xl:text-base 2xl:text-lg mb-2 text-center">
        Connect your <br />
        Spotify account
      </h3>

      <p className="lg:text-[10px] xl:text-xs 2xl:text-sm text-muted-foreground lg:mb-2 xl:mb-3 2xl:mb-4 text-center">
        Empower yourself with habit tracking while enjoying uninterrupted music
      </p>

      <Button className="shadow-sm shadow-green-soft hover:shadow-none bg-foreground hover:bg-foreground/90 text-background lg:h-7 xl:h-9 2xl:h-11 lg:text-xs xl:text-sm 2xl:text-base transition-all duration-200">
        <LinkIcon className="lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-2" />
        Link Account
      </Button>
    </div>
  );
};

export default IntegrationWidget;
