"use client";

import { useState, useEffect, useTransition } from "react";
import { branchFromTask } from "@/app/actions/kanban";
import { getProjectBranches } from "@/app/actions/project";
import { SessionType, type KanbanTask } from "@/entities/KanbanTask";
import type { Project } from "@/entities/Project";

interface BranchTaskModalProps {
  task: KanbanTask;
  projects: Project[];
  onClose: () => void;
}

/** 기존 작업에서 브랜치를 분기하는 모달. 프로젝트, 베이스 브랜치, 새 브랜치명, 세션 타입을 선택한다 */
export default function BranchTaskModal({
  task,
  projects,
  onClose,
}: BranchTaskModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || ""
  );
  const [branches, setBranches] = useState<string[]>([]);
  const [baseBranch, setBaseBranch] = useState("");
  const [branchName, setBranchName] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>(
    SessionType.TMUX
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProjectId) return;

    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (selectedProject) {
      setBaseBranch(selectedProject.defaultBranch);
    }

    getProjectBranches(selectedProjectId).then((result) => {
      setBranches(result);
    });
  }, [selectedProjectId, projects]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedProjectId || !branchName) {
      setError("프로젝트와 브랜치 이름은 필수입니다.");
      return;
    }

    startTransition(async () => {
      try {
        await branchFromTask(
          task.id,
          selectedProjectId,
          baseBranch,
          branchName,
          sessionType
        );
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "브랜치 분기에 실패했습니다."
        );
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-1">브랜치 분기</h2>
        <p className="text-sm text-gray-400 mb-4 truncate">
          {task.title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              프로젝트 *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            >
              {projects.length === 0 && (
                <option value="">등록된 프로젝트 없음</option>
              )}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.sshHost ? ` (${project.sshHost})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              베이스 브랜치
            </label>
            <select
              value={baseBranch}
              onChange={(e) => setBaseBranch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
              {branches.length === 0 && baseBranch && (
                <option value={baseBranch}>{baseBranch}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              새 브랜치 이름 *
            </label>
            <input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 font-mono"
              placeholder="feat/my-feature"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              세션 타입
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="tmux">tmux</option>
              <option value="zellij">zellij</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || projects.length === 0}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded font-medium transition-colors"
            >
              {isPending ? "생성 중..." : "분기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
