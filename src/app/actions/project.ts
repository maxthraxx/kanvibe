"use server";

import { revalidatePath } from "next/cache";
import { getProjectRepository } from "@/lib/database";
import { Project } from "@/entities/Project";
import { validateGitRepo, getDefaultBranch, listBranches, scanGitRepos } from "@/lib/gitOperations";
import path from "path";

/** TypeORM 엔티티를 직렬화 가능한 plain object로 변환한다 */
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/** 등록된 모든 프로젝트를 반환한다 */
export async function getAllProjects(): Promise<Project[]> {
  const repo = await getProjectRepository();
  const projects = await repo.find({ order: { createdAt: "ASC" } });
  return serialize(projects);
}

/** 단일 프로젝트를 ID로 조회한다 */
export async function getProjectById(projectId: string): Promise<Project | null> {
  const repo = await getProjectRepository();
  const project = await repo.findOneBy({ id: projectId });
  return project ? serialize(project) : null;
}

/**
 * 새 프로젝트를 등록한다.
 * git 저장소 유효성을 검증하고 기본 브랜치를 자동 감지한다.
 */
export async function registerProject(
  name: string,
  repoPath: string,
  sshHost?: string
): Promise<{ success: boolean; error?: string; project?: Project }> {
  if (!name || !repoPath) {
    return { success: false, error: "이름과 경로는 필수입니다." };
  }

  const isValid = await validateGitRepo(repoPath, sshHost || null);
  if (!isValid) {
    return { success: false, error: "유효한 git 저장소가 아닙니다." };
  }

  const repo = await getProjectRepository();

  const existing = await repo.findOneBy({ name });
  if (existing) {
    return { success: false, error: "이미 같은 이름의 프로젝트가 있습니다." };
  }

  const defaultBranch = await getDefaultBranch(repoPath, sshHost || null);

  const project = repo.create({
    name,
    repoPath,
    defaultBranch,
    sshHost: sshHost || null,
  });

  const saved = await repo.save(project);
  revalidatePath("/");
  return { success: true, project: serialize(saved) };
}

/** 프로젝트를 삭제한다. 연결된 작업의 projectId는 FK cascade로 null이 된다 */
export async function deleteProject(projectId: string): Promise<boolean> {
  const repo = await getProjectRepository();
  const project = await repo.findOneBy({ id: projectId });
  if (!project) return false;

  await repo.remove(project);
  revalidatePath("/");
  return true;
}

export interface ScanResult {
  registered: string[];
  skipped: string[];
  errors: string[];
}

/**
 * 지정 디렉토리 하위의 git 저장소를 스캔하여 미등록 프로젝트를 일괄 등록한다.
 * 이미 동일 경로로 등록된 프로젝트는 건너뛰고, 이름 중복 시 상위 디렉토리를 포함하여 구분한다.
 */
export async function scanAndRegisterProjects(
  rootPath: string,
  sshHost?: string
): Promise<ScanResult> {
  const result: ScanResult = { registered: [], skipped: [], errors: [] };

  const repoPaths = await scanGitRepos(rootPath, sshHost || null);
  if (repoPaths.length === 0) {
    return result;
  }

  const repo = await getProjectRepository();
  const existing = await repo.find();
  const existingPaths = new Set(
    existing.map((p) => `${p.sshHost || ""}:${p.repoPath}`)
  );
  const existingNames = new Set(existing.map((p) => p.name));

  /** 폴더명 기반 프로젝트 이름을 생성한다. 중복 시 상위 디렉토리를 포함한다 */
  function resolveProjectName(repoPath: string): string {
    const baseName = path.basename(repoPath);
    if (!existingNames.has(baseName)) {
      existingNames.add(baseName);
      return baseName;
    }

    const parentName = path.basename(path.dirname(repoPath));
    const combinedName = `${parentName}/${baseName}`;
    if (!existingNames.has(combinedName)) {
      existingNames.add(combinedName);
      return combinedName;
    }

    let counter = 2;
    while (existingNames.has(`${baseName}-${counter}`)) {
      counter++;
    }
    const numberedName = `${baseName}-${counter}`;
    existingNames.add(numberedName);
    return numberedName;
  }

  for (const repoPath of repoPaths) {
    const pathKey = `${sshHost || ""}:${repoPath}`;
    if (existingPaths.has(pathKey)) {
      result.skipped.push(repoPath);
      continue;
    }

    try {
      const defaultBranch = await getDefaultBranch(repoPath, sshHost || null);
      const projectName = resolveProjectName(repoPath);

      const project = repo.create({
        name: projectName,
        repoPath,
        defaultBranch,
        sshHost: sshHost || null,
      });

      await repo.save(project);
      existingPaths.add(pathKey);
      result.registered.push(projectName);
    } catch (error) {
      result.errors.push(
        `${repoPath}: ${error instanceof Error ? error.message : "등록 실패"}`
      );
    }
  }

  revalidatePath("/");
  return result;
}

/** 프로젝트의 브랜치 목록을 반환한다 */
export async function getProjectBranches(projectId: string): Promise<string[]> {
  const repo = await getProjectRepository();
  const project = await repo.findOneBy({ id: projectId });
  if (!project) return [];

  return listBranches(project.repoPath, project.sshHost);
}
