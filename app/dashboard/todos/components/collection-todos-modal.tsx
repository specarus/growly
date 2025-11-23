"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import type { FC } from "react";

import useLockBodyScroll from "../../../hooks/use-lock-body-scroll";
import { statusColors } from "../constants";
import type { Collection, TodoRow } from "../types";

interface CollectionTodosModalProps {
  collection: Collection;
  todos: TodoRow[];
  onClose: () => void;
}

const CollectionTodosModal: FC<CollectionTodosModalProps> = ({
  collection,
  todos,
  onClose,
}) => {
  useLockBodyScroll(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
        className="relative w-full xl:max-w-2xl 2xl:max-w-3xl overflow-hidden rounded-3xl border border-gray-100 bg-white text-foreground shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-5">
          <div className="space-y-1">
            <p className="xl:text-[11px] 2xl:text-xs uppercase tracking-[0.2em] text-muted-foreground/80 font-semibold">
              Collection
            </p>
            <h3
              id="collection-modal-title"
              className="xl:text-lg 2xl:text-xl font-semibold text-foreground"
            >
              {collection.name}
            </h3>
            <p className="xl:text-xs 2xl:text-sm text-muted-foreground">
              {collection.description || "No description yet."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xl:text-[11px] 2xl:text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="px-5 pt-4 xl:text-[11px] 2xl:text-xs text-muted-foreground">
          Showing {todos.length} todo{todos.length === 1 ? "" : "s"}
        </div>
        <div className="max-h-[65vh] space-y-3 overflow-auto border-gray-100 px-5 py-5">
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No todos in this collection yet.<br></br>Add one to keep this
              space meaningful.
            </p>
          ) : (
            todos.map((todo) => {
              const statusColor = statusColors[todo.status];
              return (
                <div
                  key={todo.id}
                  className="rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold xl:text-[13px] 2xl:text-sm truncate">
                      {todo.title}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full xl:text-[10px] 2xl:text-[11px]"
                      style={{
                        backgroundColor: `${statusColor}22`,
                        color: statusColor,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      {todo.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 xl:text-[11px] 2xl:text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {todo.dueDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {todo.dueTime}
                    </span>
                  </div>
                  {todo.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1 xl:text-[10px] 2xl:text-[11px] text-muted-foreground">
                      {todo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionTodosModal;
