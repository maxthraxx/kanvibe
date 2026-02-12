"use client";

import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("task");
  const tc = useTranslations("common");
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-bg-overlay">
      <div className="w-full max-w-md bg-bg-surface rounded-xl border border-border-default shadow-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          {t("createTitle")}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("titleRequired")}
            </label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
              placeholder={t("titlePlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">
              {t("descriptionLabel")}
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary resize-none transition-colors"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={isWithSession}
                onChange={(e) => setIsWithSession(e.target.checked)}
                className="rounded"
              />
              {t("createWithSession")}
            </label>
          </div>

          {isWithSession && (
            <>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t("project")}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                >
                  <option value="">{t("projectSelect")}</option>
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
                  <label className="block text-sm text-text-secondary mb-1">
                    {t("baseBranch")}
                  </label>
                  <select
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary font-mono transition-colors"
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
                <label className="block text-sm text-text-secondary mb-1">
                  {t("branchName")}
                </label>
                <input
                  name="branchName"
                  className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary font-mono transition-colors"
                  placeholder={t("branchPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t("sessionType")}
                </label>
                <select
                  name="sessionType"
                  className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                >
                  <option value="tmux">tmux</option>
                  <option value="zellij">zellij</option>
                </select>
              </div>

              {!selectedProjectId && sshHosts.length > 0 && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    {t("sshHost")}
                  </label>
                  <select
                    name="sshHost"
                    className="w-full px-3 py-2 bg-bg-page border border-border-default rounded-md text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                  >
                    <option value="">{tc("local")}</option>
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
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-text-inverse rounded-md font-medium transition-colors"
            >
              {isPending ? tc("creating") : tc("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
