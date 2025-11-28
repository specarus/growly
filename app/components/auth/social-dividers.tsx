import Button from "../ui/button";
import Image from "next/image";

const SocialLoginDividers: React.FC = () => (
  <div className="space-y-4">
    <div className="relative xl:my-4 2xl:my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-muted" />
      </div>
      <div className="relative flex justify-center xl:text-xs 2xl:text-sm">
        <span className="px-4 bg-white text-muted-foreground">
          Or continue with
        </span>
      </div>
    </div>

    <Button
      type="button"
      className="flex items-center xl:gap-2 xl:text-sm 2xl:text-base xl:h-10 2xl:h-12 border border-muted text-foreground hover:bg-gray-50 bg-white"
    >
      <Image
        src={"/google-icon.png"}
        height={100}
        width={100}
        alt="Google"
        className="xl:w-6 xl:h-6 2xl:w-8 2xl:h-8"
      />
      <p>Google</p>
    </Button>
  </div>
);

export default SocialLoginDividers;
