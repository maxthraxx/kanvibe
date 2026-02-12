"use client";

import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import type { KanbanTask, TaskStatus } from "@/entities/KanbanTask";

interface ColumnProps {
  status: TaskStatus;
  tasks: KanbanTask[];
  label: string;
  color: string;
  onContextMenu: (e: React.MouseEvent, task: KanbanTask) => void;
}

export default function Column({ status, tasks, label, color, onContextMenu }: ColumnProps) {
  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className="flex items-center gap-2 mb-3 px-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          {label}
        </h2>
        <span className="text-xs text-gray-500 ml-auto">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver
                ? "bg-gray-800/50 border border-dashed border-gray-600"
                : "bg-transparent"
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onContextMenu={onContextMenu} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
