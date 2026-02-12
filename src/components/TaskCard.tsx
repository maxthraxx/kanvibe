"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Link } from "@/i18n/navigation";
import type { KanbanTask } from "@/entities/KanbanTask";

interface TaskCardProps {
  task: KanbanTask;
  index: number;
  onContextMenu: (e: React.MouseEvent, task: KanbanTask) => void;
}

const agentTagColors: Record<string, string> = {
  claude: "bg-tag-claude-bg text-tag-claude-text",
  gemini: "bg-tag-gemini-bg text-tag-gemini-text",
  codex: "bg-tag-codex-bg text-tag-codex-text",
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
            className={`p-3 mb-2 rounded-lg border transition-all cursor-pointer ${
              snapshot.isDragging
                ? "bg-bg-surface border-brand-primary shadow-md"
                : "bg-bg-surface border-border-default hover:border-border-strong hover:shadow-sm"
            }`}
          >
            <h3 className="text-sm font-medium text-text-primary truncate">
              {task.title}
            </h3>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.branchName && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-branch-bg text-tag-branch-text font-mono truncate max-w-[140px]">
                  {task.branchName}
                </span>
              )}

              {task.agentType && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    agentTagColors[task.agentType] || "bg-tag-neutral-bg text-tag-neutral-text"
                  }`}
                >
                  {task.agentType}
                </span>
              )}

              {task.sessionType && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-session-bg text-tag-session-text">
                  {task.sessionType}
                </span>
              )}

              {task.sshHost && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-ssh-bg text-tag-ssh-text">
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
