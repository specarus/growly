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

  const selectedDays = [2, 5, 8, 12, 15, 20, 24, 28, 30];

  const numDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const days = Array.from({ length: numDaysInMonth }, (_, i) => i + 1);

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
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[1px] border-gray-50 shadow-md">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Button
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 w-7 h-7 sm:w-8 sm:h-8"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
          {getMonthName(currentMonth)}, {currentYear}
        </h3>
        <Button
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 w-7 h-7 sm:w-8 sm:h-8"
          onClick={handleNextMonth}
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {dayWeeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className={`grid grid-cols-7 gap-1.5 sm:gap-2 ${
            weekIndex < dayWeeks.length - 1 ? "mb-3 sm:mb-4" : ""
          }`}
        >
          {week.map((day, dayIndex) => {
            if (day === null) {
              return (
                <div
                  key={`pad-${weekIndex}-${dayIndex}`}
                  className="aspect-square"
                ></div>
              );
            }

            const isSelected = selectedDays.includes(day);

            let dayClasses =
              "text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out";

            if (
              isSelected &&
              currentYear === now.getFullYear() &&
              currentMonth === now.getMonth()
            ) {
              dayClasses =
                "border-2 border-primary text-gray-900 dark:text-white font-medium transition-colors duration-300 ease-in-out"; // **2. Add transition class here too**

              if (day === 30) {
                dayClasses =
                  "bg-primary text-white font-medium transition-colors duration-300 ease-in-out"; // **3. Add transition class here too**
              }
            }

            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center text-xs sm:text-sm rounded-full ${dayClasses}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      ))}

      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-500 font-medium">
        +3,2% from last month
      </div>
    </Card>
  );
};

export default CalendarWidget;
