"use client";

import { useState, useTransition } from "react";
import {
  deleteProject,
  scanAndRegisterProjects,
  type ScanResult,
} from "@/app/actions/project";
import type { Project } from "@/entities/Project";

interface ProjectSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  sshHosts: string[];
}

export default function ProjectSettings({
  isOpen,
  onClose,
  projects,
  sshHosts,
}: ProjectSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  if (!isOpen) return null;

  function handleScan(formData: FormData) {
    setError(null);
    setSuccessMessage(null);
    setScanResult(null);

    const scanPath = formData.get("scanPath") as string;
    if (!scanPath) {
      setError("스캔할 디렉토리 경로를 입력하세요.");
      return;
    }

    startTransition(async () => {
      const result = await scanAndRegisterProjects(
        scanPath,
        (formData.get("scanSshHost") as string) || undefined
      );
      setScanResult(result);

      if (result.registered.length > 0) {
        setSuccessMessage(
          `${result.registered.length}개 프로젝트 등록 완료`
        );
      } else if (result.skipped.length > 0) {
        setSuccessMessage("새로 등록할 프로젝트가 없습니다.");
      } else {
        setError("git 저장소를 찾을 수 없습니다.");
      }
    });
  }

  function handleDelete(projectId: string, projectName: string) {
    if (!confirm(`"${projectName}" 프로젝트를 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      await deleteProject(projectId);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-14 pr-4">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-96 bg-gray-900 rounded-lg border border-gray-700 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-sm font-semibold">프로젝트 관리</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            &times;
          </button>
        </div>

        {/* 디렉토리 스캔 등록 */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            디렉토리 스캔
          </h3>

          <form action={handleScan} className="space-y-3">
            <input
              name="scanPath"
              required
              placeholder="스캔할 디렉토리 경로 (예: ~/Documents)"
              className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 font-mono"
            />

            {sshHosts.length > 0 && (
              <select
                name="scanSshHost"
                className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">로컬</option>
                {sshHosts.map((host) => (
                  <option key={host} value={host}>
                    {host}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded transition-colors"
            >
              {isPending ? "스캔 중..." : "스캔 및 등록"}
            </button>
          </form>

          {scanResult && (
            <div className="mt-3 space-y-1">
              {scanResult.registered.length > 0 && (
                <div className="text-xs text-green-400">
                  등록: {scanResult.registered.join(", ")}
                </div>
              )}
              {scanResult.skipped.length > 0 && (
                <div className="text-xs text-gray-500">
                  건너뜀: {scanResult.skipped.length}개 (이미 등록)
                </div>
              )}
              {scanResult.errors.length > 0 && (
                <div className="text-xs text-red-400">
                  오류: {scanResult.errors.length}개
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          {successMessage && (
            <p className="text-xs text-green-400 mt-2">{successMessage}</p>
          )}
        </div>

        {/* 등록된 프로젝트 목록 */}
        <div className="p-4 space-y-3">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide">
            등록된 프로젝트 ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <p className="text-sm text-gray-500">
              등록된 프로젝트가 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between p-2 bg-gray-800 rounded"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {project.sshHost && (
                        <span className="text-teal-400">
                          {project.sshHost}:
                        </span>
                      )}
                      {project.repoPath}
                    </p>
                    <p className="text-xs text-gray-500">
                      기본 브랜치: {project.defaultBranch}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    disabled={isPending}
                    className="ml-2 text-xs text-red-400 hover:text-red-300 shrink-0"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
