import { Checkbox } from "@/components/ui/checkbox";
import { Clock, MapPin } from "lucide-react";

const Todo = ({ todo }) => {
  return (
    <div key={todo.id} className="flex items-start gap-3 select-none">
      <div
        className={`xl:p-1.5 2xl:p-2 xl:rounded-lg 2xl:rounded-xl ${todo.iconBg} flex-shrink-0`}
      >
        <todo.icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium mb-1 xl:text-sm 2xl:text-base truncate ${
            todo.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {todo.title}
        </div>
        <div className="flex items-center xl:gap-2 2xl:gap-3 xl:text-xs 2xl:text-sm text-muted-foreground">
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
        className="data-[state=checked]:bg-green-soft data-[state=checked]:border-green-soft flex-shrink-0 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6"
      />
    </div>
  );
};

export default Todo;
