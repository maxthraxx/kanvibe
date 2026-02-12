"use client";

import { useState, useEffect, useTransition } from "react";
import { createTask } from "@/app/actions/kanban";
import { getProjectBranches } from "@/app/actions/project";
import { SessionType } from "@/entities/KanbanTask";
import type { Project } from "@/entities/Project";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  sshHosts: string[];
  projects: Project[];
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  sshHosts,
  projects,
}: CreateTaskModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isWithSession, setIsWithSession] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [baseBranch, setBaseBranch] = useState("");

  useEffect(() => {
    if (!selectedProjectId) {
      setBranches([]);
      setBaseBranch("");
      return;
    }

    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    if (selectedProject) {
      setBaseBranch(selectedProject.defaultBranch);
    }

    getProjectBranches(selectedProjectId).then((result) => {
      setBranches(result);
    });
  }, [selectedProjectId, projects]);

  if (!isOpen) return null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createTask({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        branchName: (formData.get("branchName") as string) || undefined,
        baseBranch: baseBranch || undefined,
        sessionType: (formData.get("sessionType") as SessionType) || undefined,
        sshHost: (formData.get("sshHost") as string) || undefined,
        projectId: selectedProjectId || undefined,
      });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">새 작업 생성</h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">제목 *</label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              placeholder="작업 제목"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">설명</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="작업 설명 (선택)"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isWithSession}
                onChange={(e) => setIsWithSession(e.target.checked)}
                className="rounded"
              />
              Branch + 세션과 함께 생성
            </label>
          </div>

          {isWithSession && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  프로젝트
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">프로젝트 선택</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                      {project.sshHost ? ` (${project.sshHost})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectId && (
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
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Branch 이름
                </label>
                <input
                  name="branchName"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="feat/my-feature"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  세션 타입
                </label>
                <select
                  name="sessionType"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="tmux">tmux</option>
                  <option value="zellij">zellij</option>
                </select>
              </div>

              {!selectedProjectId && sshHosts.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    SSH 호스트 (선택)
                  </label>
                  <select
                    name="sshHost"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">로컬</option>
                    {sshHosts.map((host) => (
                      <option key={host} value={host}>
                        {host}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

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
              disabled={isPending}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded font-medium transition-colors"
            >
              {isPending ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
