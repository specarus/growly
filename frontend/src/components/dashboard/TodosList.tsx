import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Book,
  ShoppingCart,
  Salad,
  BookOpen,
  Waves,
  Clock,
  MapPin,
} from "lucide-react";

const TodosList = () => {
  const todos = [
    {
      id: 1,
      title: "Study",
      time: "10:00am",
      location: "K-Cafe",
      icon: Book,
      completed: false,
      iconBg: "bg-yellow-soft",
    },
    {
      id: 2,
      title: "Groceries",
      time: "02:00pm",
      location: "Hayday Market",
      icon: ShoppingCart,
      completed: false,
      iconBg: "bg-muted",
    },
    {
      id: 3,
      title: "Eat Healthy Food",
      time: "08:30am",
      location: "Home",
      icon: Salad,
      completed: true,
      iconBg: "bg-green-soft/20",
    },
    {
      id: 4,
      title: "Read a book",
      time: "08:00am",
      location: "Library",
      icon: BookOpen,
      completed: true,
      iconBg: "bg-coral/20",
    },
    {
      id: 5,
      title: "Swimming for 45min",
      time: "06:00am",
      location: "Gym Pool",
      icon: Waves,
      completed: true,
      iconBg: "bg-blue-100",
    },
  ];

  return (
    <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-0 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-semibold text-base sm:text-lg">Today's Todos</h3>
        <button className="text-xs sm:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          View Details
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-start gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${todo.iconBg} flex-shrink-0`}>
              <todo.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`font-medium mb-1 text-sm sm:text-base truncate ${
                  todo.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {todo.title}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {todo.time}
                </span>
                <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{todo.location}</span>
                </span>
              </div>
            </div>
            <Checkbox
              checked={todo.completed}
              className="data-[state=checked]:bg-green-soft data-[state=checked]:border-green-soft flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TodosList;
