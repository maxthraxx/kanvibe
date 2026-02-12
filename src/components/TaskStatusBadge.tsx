import { TaskStatus } from "@/entities/KanbanTask";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.TODO]: {
    label: "Todo",
    className: "bg-gray-700 text-gray-300",
  },
  [TaskStatus.PROGRESS]: {
    label: "Progress",
    className: "bg-yellow-900/60 text-yellow-300",
  },
  [TaskStatus.REVIEW]: {
    label: "Review",
    className: "bg-blue-900/60 text-blue-300",
  },
  [TaskStatus.DONE]: {
    label: "Done",
    className: "bg-green-900/60 text-green-300",
  },
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
