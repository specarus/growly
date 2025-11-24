export type Status = "Planned" | "In Progress" | "Completed" | "Missed";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface TodoRow {
  id: string;
  title: string;
  status: Status;
  category: string;
  priority: Priority;
  dueDate: string;
  dueTime: string;
  dueAtIso: string | null;
  location: string;
  reminder: string;
  tags: string[];
  collectionIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  todoIds: string[];
}
