import { notFound } from "next/navigation";
import Link from "next/link";
import { getTaskById, updateTaskStatus, deleteTask } from "@/app/actions/kanban";
import { TaskStatus } from "@/entities/KanbanTask";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import TerminalLoader from "@/components/TerminalLoader";

export const dynamicConfig = "force-dynamic";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 상태 전환 버튼에 표시할 다음 상태 목록.
 * 현재 상태를 제외한 나머지를 선택 가능하게 한다.
 */
const STATUS_TRANSITIONS: { status: TaskStatus; label: string }[] = [
  { status: TaskStatus.TODO, label: "Todo로 이동" },
  { status: TaskStatus.PROGRESS, label: "Progress로 이동" },
  { status: TaskStatus.REVIEW, label: "Review로 이동" },
  { status: TaskStatus.DONE, label: "Done으로 이동" },
];

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) notFound();

  const hasTerminal = task.sessionType && task.sessionName;

  async function handleStatusChange(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as TaskStatus;
    await updateTaskStatus(id, newStatus);
  }

  async function handleDelete() {
    "use server";
    await deleteTask(id);
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-gray-800">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; 보드로 돌아가기
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <TaskStatusBadge status={task.status} />
            </div>

            {task.description && (
              <p className="text-gray-400 mt-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-gray-400">
              {task.branchName && (
                <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                  {task.branchName}
                </span>
              )}
              {task.agentType && <span>Agent: {task.agentType}</span>}
              {task.sessionType && <span>Session: {task.sessionType}</span>}
              {task.sshHost && <span>SSH: {task.sshHost}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_TRANSITIONS.filter((t) => t.status !== task.status).map(
              (transition) => (
                <form key={transition.status} action={handleStatusChange}>
                  <input type="hidden" name="status" value={transition.status} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                  >
                    {transition.label}
                  </button>
                </form>
              )
            )}
            <form action={handleDelete}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded transition-colors"
              >
                삭제
              </button>
            </form>
          </div>
        </div>

        {hasTerminal ? (
          <div>
            <h2 className="text-lg font-semibold mb-3">터미널</h2>
            <TerminalLoader taskId={task.id} />
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 border border-dashed border-gray-700 rounded-lg">
            이 작업에는 연결된 터미널 세션이 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
