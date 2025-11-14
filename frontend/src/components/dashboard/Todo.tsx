import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin } from "lucide-react";

const Todo = ({ todo }) => {
  return (
    <div key={todo.id} className="flex items-start gap-2 sm:gap-3 select-none">
      <div
        className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${todo.iconBg} flex-shrink-0`}
      >
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
        className="data-[state=checked]:bg-green-soft data-[state=checked]:border-green-soft flex-shrink-0 w-6 h-6"
      />
    </div>
  );
};

export default Todo;
