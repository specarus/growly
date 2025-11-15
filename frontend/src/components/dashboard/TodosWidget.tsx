import { Card } from "@/components/ui/card";
import Todo from "@/components/dashboard/Todo";

import { Book, ShoppingCart, Salad, BookOpen, Waves } from "lucide-react";

const TodosWidget = () => {
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
    <Card className="xl:p-2 2xl:p-6 border-0 shadow-none">
      <div className="flex items-center justify-between xl:mb-4 2xl:mb-6">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Today's Todos</h3>
        <button className="xl:text-xs 2xl:text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
          View Details
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {todos.map((todo) => (
          <Todo todo={todo} />
        ))}
      </div>
    </Card>
  );
};

export default TodosWidget;
