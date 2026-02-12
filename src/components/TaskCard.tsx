"use client";

import { Draggable } from "@hello-pangea/dnd";
import Link from "next/link";
import type { KanbanTask } from "@/entities/KanbanTask";

interface TaskCardProps {
  task: KanbanTask;
  index: number;
  onContextMenu: (e: React.MouseEvent, task: KanbanTask) => void;
}

const agentBadgeColors: Record<string, string> = {
  claude: "bg-orange-900/50 text-orange-300",
  gemini: "bg-blue-900/50 text-blue-300",
  codex: "bg-green-900/50 text-green-300",
};

export default function TaskCard({ task, index, onContextMenu }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Link href={`/task/${task.id}`}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onContextMenu={(e) => onContextMenu(e, task)}
            className={`p-3 mb-2 rounded-lg border transition-colors cursor-pointer ${
              snapshot.isDragging
                ? "bg-gray-700 border-blue-500 shadow-lg"
                : "bg-gray-800 border-gray-700 hover:border-gray-600"
            }`}
          >
            <h3 className="text-sm font-medium text-white truncate">
              {task.title}
            </h3>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.branchName && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-mono truncate max-w-[140px]">
                  {task.branchName}
                </span>
              )}

              {task.agentType && (
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    agentBadgeColors[task.agentType] || "bg-gray-700 text-gray-300"
                  }`}
                >
                  {task.agentType}
                </span>
              )}

              {task.sessionType && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">
                  {task.sessionType}
                </span>
              )}

              {task.sshHost && (
                <span className="text-xs px-2 py-0.5 rounded bg-teal-900/50 text-teal-300">
                  {task.sshHost}
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    </Draggable>
  );
}
