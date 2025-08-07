import Demo from "@/components/Results";
import AI_Prompt from "@/components/ui/animated-ai.input";

const page = () => {
  return (
    <div className="text-center flex w-full flex-1 flex-col gap-1 pt-14 md:pt-19 pb-5 px-5 sm:px-6 lg:px-8">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
        Rapid Search
      </h1>
      <p className="text-sm sm:text-base lg:text-md text-gray-600">
        Enter keywords seperated by commas for rapid search.
      </p>
      <AI_Prompt />
      <div>
        <Demo />
      </div>
    </div>
  );
};

export default page;
