import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const chunkArray = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, monthIndex) => {
  return new Date(year, monthIndex, 1).getDay();
};

const getMonthName = (monthIndex) => {
  return new Date(2000, monthIndex).toLocaleString("en-US", { month: "long" });
};

const CalendarWidget = () => {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const numDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const step = 0.1;
  const max = 1;

  const days = Array.from({ length: numDaysInMonth }, (_, i) => ({
    day: i + 1,
    progress: Math.floor(Math.random() * (max / step + 1)) * step,
  }));

  const paddedDays = [...Array(firstDayIndex).fill(null), ...days];

  const dayWeeks = chunkArray(paddedDays, 7);

  const handlePreviousMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1)
    );
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="border-none shadow-none xl:min-h-80 2xl:min-h-96">
      <div className="flex items-center justify-between xl:mb-2 2xl:mb-4">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl text-gray-900 dark:text-white">
          {getMonthName(currentMonth)}, {currentYear}
        </h3>
        <div className="flex gap-3 xl:gap-1 2xl:gap-2 items-center">
          <Button
            size="icon"
            className="rounded-full text-muted-foreground hover:text-white bg-white hover:bg-primary/90 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
          </Button>
          <Button
            size="icon"
            className="rounded-full text-muted-foreground hover:text-white bg-white hover:bg-primary/90 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7"
            onClick={handleNextMonth}
          >
            <ChevronRight className="xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center xl:text-xs 2xl:text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {dayName}
          </div>
        ))}
      </div>

      {dayWeeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className={`grid grid-cols-7 xl:gap-1.5 2xl:gap-2 ${
            weekIndex < dayWeeks.length - 1 ? "xl:mb-2 2xl:mb-3" : ""
          }`}
        >
          {week.map((dayObj, dayIndex) => {
            if (dayObj === null) {
              return <div key={`pad-${weekIndex}-${dayIndex}`}></div>;
            }

            const { day, progress } = dayObj;

            return (
              <div
                key={day}
                className={`${
                  progress == 1 ? "text-white bg-primary" : ""
                } relative xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 flex items-center justify-center xl:text-xs 2xl:text-sm rounded-full`}
              >
                {day}
                <svg
                  className="absolute w-full h-full inset-0"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    strokeDasharray={300}
                    strokeDashoffset={0}
                    className="stroke-muted-foreground/30 stroke-[2px] fill-none"
                  />
                </svg>

                <svg
                  className="absolute w-full h-full inset-0"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    strokeDasharray={300}
                    strokeDashoffset={300 * (1 - progress)}
                    className="stroke-primary stroke-[4px] fill-none transition-all duration-300"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      ))}

      <div className="xl:mt-2 2xl:mt-3 xl:text-xs 2xl:text-sm text-green-500 font-medium">
        +3,2% from last month
      </div>
    </Card>
  );
};

export default CalendarWidget;
