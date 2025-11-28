"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Plus, Search, Trash2 } from "lucide-react";
import type { DragEvent, FC } from "react";

import { statusColors } from "../constants";
import type { Collection, TodoRow } from "../types";

export interface CollectionCardProps {
  collection: Collection;
  assignedCount: number;
  selectableTodos: TodoRow[];
  isPickerOpen: boolean;
  assignmentPending: boolean;
  collectionAssignSearch: string;
  onCollectionAssignSearch: (value: string) => void;
  onTogglePicker: () => void;
  onAddTodo: (todoId: string) => void;
  isDropTarget?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDropTodo: (todoId: string) => void;
  onDelete?: () => void;
  deleting?: boolean;
}

const CollectionCard: FC<CollectionCardProps> = ({
  collection,
  assignedCount,
  selectableTodos,
  isPickerOpen,
  assignmentPending,
  collectionAssignSearch,
  onCollectionAssignSearch,
  onTogglePicker,
  onAddTodo,
  isDropTarget = false,
  onDragEnter,
  onDragLeave,
  onDropTodo,
  onDelete,
  deleting = false,
}) => {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragEnter?.();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    onDragLeave?.();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const todoId = event.dataTransfer.getData("text/todo-id");
    if (todoId) {
      onDropTodo(todoId);
    }
    onDragLeave?.();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border border-gray-100 bg-white/70 shadow-sm p-3 hover:border-primary/40 transition ${
        isDropTarget
          ? "border-primary/60 ring-2 ring-primary/40 bg-primary/5"
          : ""
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="xl:text-[9px] 2xl:text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Collection
            </p>
            <Link
              href={`/dashboard/todos/collections/${collection.id}`}
              className="block xl:text-sm 2xl:text-base font-semibold hover:text-primary transition truncate"
            >
              {collection.name}
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold text-muted-foreground">
              {assignedCount} todo{assignedCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePicker}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-green-soft shadow-sm hover:border-green-soft/60 transition disabled:opacity-50"
              disabled={assignmentPending || deleting}
              aria-label="Add todo to collection"
            >
              <Plus className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!onDelete) return;
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(
                    `Delete "${collection.name}" and remove its todos?`
                  )
                ) {
                  return;
                }
                onDelete();
              }}
              className="inline-flex items-center justify-center p-2 rounded-full border border-transparent bg-destructive/10 text-destructive shadow-sm hover:border-destructive/60 transition disabled:opacity-50"
              disabled={assignmentPending || deleting}
              aria-label="Delete collection"
            >
              <Trash2
                className={`xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 ${
                  deleting ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end text-xs text-muted-foreground">
          <Link
            href={`/dashboard/todos/collections/${collection.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 xl:text-[10px] 2xl:text-[11px] font-semibold text-foreground transition hover:border-primary/60"
          >
            View todos
          </Link>
        </div>
      </div>

      {isPickerOpen ? (
        <div className="absolute right-0 top-14 z-20 w-full rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-inner text-xs text-muted-foreground">
              <Search className="w-3.5 h-3.5" />
              <input
                value={collectionAssignSearch}
                onChange={(event) =>
                  onCollectionAssignSearch(event.target.value)
                }
                autoFocus
                placeholder="Search todos by title or tag"
                className="w-full bg-transparent focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-gray-50">
            {selectableTodos.length === 0 ? (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No matching todos
              </div>
            ) : (
              selectableTodos.map((todo) => (
                <button
                  key={todo.id}
                  type="button"
                  onClick={() => onAddTodo(todo.id)}
                  className="w-full text-left px-3 py-3 hover:bg-primary/5 transition"
                  disabled={assignmentPending}
                >
                  <p className="font-semibold text-sm truncate">{todo.title}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {todo.dueDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {todo.dueTime}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                    {todo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CollectionCard;
