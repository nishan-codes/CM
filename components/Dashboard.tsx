import { ChartAreaInteractive } from "@/components/Chart";
import { TableDemo } from "@/components/Table";
import { Eye, MousePointerClick, TrendingDown, TrendingUp, UserRoundCheck, Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex w-full flex-1 flex-col gap-2 border border-border bg-background pt-14 md:pt-19 px-5 sm:px-6 lg:px-8">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
        Dashboard
      </h1>
      {/* 1st section  */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <Card 
          title="Views"
          count="40,689"
          difference={8.5}
          icon={<Users fill="black"/>}
          className={"bg-blue-100"}
        />
        <Card 
          title="CTR"
          count="102,983"
          difference={1.3}
          icon={<MousePointerClick fill="black"/>}
          className={"bg-yellow-100"}
        />
        <Card 
          title="Avg View Duration"
          count="89,000"
          difference={-4.3}
          icon={<Eye/>}
          className={"bg-green-100"}
        />
        <Card 
          title="Sub Rate"
          count="2040"
          difference={1.8}
          icon={<UserRoundCheck/>}
          className={"bg-red-100"}
        />
      </div>

      {/* 2nd section */}

      <div className="mt-4">
        <ChartAreaInteractive />
      </div>

      {/* 3rd section  */}

      <div className="my-4 p-4 border border-border bg-card rounded-lg shadow-sm">
        <h2 className="text-md sm:text-lg lg:text-xl font-semibold mb-4">
          Top Performing Videos
          </h2>
        <TableDemo />
      </div>

    </div>
  )
}

type CardProps = {
  title: string;
  count: string;
  difference: number;
  icon: React.ReactNode;
  className?: string;
};

const Card = ({ title, count, difference, icon, className }: CardProps) => {
  return (
    <div className="p-4 shadow-sm bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-md">{title}</h2>
          <p className="text-lg font-semibold">{count}</p>
        </div>
        <div className={`${className} rounded-full p-3`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <p
          className={`flex items-center gap-2 text-sm ${
            difference > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {difference > 0 ? (
            <TrendingUp width={15} height={15}/>
          ) : (
            <TrendingDown width={15} height={15}/>
          )}
          {difference > 0 ? "+" : ""}
          {difference}%
          {" "}
        </p>
          <p className="text-sm">
            {difference > 0 ? "Up from yesterday" : "Down from yesterday"}
          </p>
      </div>
    </div>
  );
};

export default Dashboard