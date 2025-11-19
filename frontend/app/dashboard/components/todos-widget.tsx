import DetailsButton from "@/app/components/ui/details-button";
import Todo from "./Todo";
import {
  Book,
  ShoppingCart,
  Salad,
  BookOpen,
  Waves,
  LucideIcon,
} from "lucide-react";

interface TodoItem {
  id: number;
  title: string;
  time: string;
  location: string;
  icon: LucideIcon;
  completed: boolean;
  iconBg: string;
}

interface TodosWidgetProps {}

const TodosWidget: React.FC<TodosWidgetProps> = () => {
  const todos: TodoItem[] = [
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
    <div className="xl:p-2 2xl:p-6 text-foreground">
      <div className="flex items-center justify-between xl:mb-4 2xl:mb-6">
        <h3 className="font-semibold xl:text-lg 2xl:text-xl">Today's Todos</h3>
        <DetailsButton />
      </div>

      <div className="xl:space-y-3 2xl:space-y-4">
        {todos.map((todo) => (
          <Todo key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};

export default TodosWidget;
