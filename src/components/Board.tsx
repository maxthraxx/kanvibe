"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import Column from "./Column";
import CreateTaskModal from "./CreateTaskModal";
import ProjectSettings from "./ProjectSettings";
import TaskContextMenu from "./TaskContextMenu";
import BranchTaskModal from "./BranchTaskModal";
import { updateTaskStatus, reorderTasks, deleteTask } from "@/app/actions/kanban";
import type { TasksByStatus } from "@/app/actions/kanban";
import { TaskStatus, type KanbanTask } from "@/entities/KanbanTask";
import type { Project } from "@/entities/Project";
import { logoutAction } from "@/app/actions/auth";

interface BoardProps {
  initialTasks: TasksByStatus;
  sshHosts: string[];
  projects: Project[];
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.TODO, label: "Todo", color: "bg-gray-400" },
  { status: TaskStatus.PROGRESS, label: "Progress", color: "bg-yellow-400" },
  { status: TaskStatus.REVIEW, label: "Review", color: "bg-blue-400" },
  { status: TaskStatus.DONE, label: "Done", color: "bg-green-400" },
];

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  task: KanbanTask | null;
}

export default function Board({ initialTasks, sshHosts, projects }: BoardProps) {
  const [tasks, setTasks] = useState<TasksByStatus>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    task: null,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;

      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      setTasks((prev) => {
        const updated = { ...prev };

        const sourceTasks = [...updated[sourceStatus]];
        const [movedTask] = sourceTasks.splice(source.index, 1);

        if (sourceStatus === destStatus) {
          sourceTasks.splice(destination.index, 0, movedTask);
          updated[sourceStatus] = sourceTasks;

          reorderTasks(
            sourceStatus,
            sourceTasks.map((t) => t.id)
          );
        } else {
          const destTasks = [...updated[destStatus]];
          const updatedTask: KanbanTask = { ...movedTask, status: destStatus };
          destTasks.splice(destination.index, 0, updatedTask);

          updated[sourceStatus] = sourceTasks;
          updated[destStatus] = destTasks;

          updateTaskStatus(draggableId, destStatus);
        }

        return updated;
      });
    },
    []
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: KanbanTask) => {
      e.preventDefault();
      setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, task });
    },
    []
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false, task: null }));
  }, []);

  const handleBranchFromCard = useCallback(() => {
    setIsBranchModalOpen(true);
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleDeleteFromCard = useCallback(() => {
    if (contextMenu.task && confirm("이 작업을 삭제하시겠습니까?")) {
      deleteTask(contextMenu.task.id);
    }
    handleCloseContextMenu();
  }, [contextMenu.task, handleCloseContextMenu]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">KanVibe</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            + 새 작업
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            title="설정"
          >
            &#9881;
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="p-6">
        {isMounted ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto">
              {COLUMNS.map((col) => (
                <Column
                  key={col.status}
                  status={col.status}
                  tasks={tasks[col.status]}
                  label={col.label}
                  color={col.color}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="flex gap-4 overflow-x-auto">
            {COLUMNS.map((col) => (
              <div key={col.status} className="flex-1 min-w-[280px] max-w-[350px]">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    {col.label}
                  </h2>
                </div>
                <div className="min-h-[200px] p-2 rounded-lg" />
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sshHosts={sshHosts}
        projects={projects}
      />

      <ProjectSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projects={projects}
        sshHosts={sshHosts}
      />

      {contextMenu.isOpen && contextMenu.task && (
        <TaskContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onBranch={handleBranchFromCard}
          onDelete={handleDeleteFromCard}
          hasBranch={!!contextMenu.task.branchName}
        />
      )}

      {isBranchModalOpen && contextMenu.task && (
        <BranchTaskModal
          task={contextMenu.task}
          projects={projects}
          onClose={() => {
            setIsBranchModalOpen(false);
            handleCloseContextMenu();
          }}
        />
      )}
    </div>
  );
}
