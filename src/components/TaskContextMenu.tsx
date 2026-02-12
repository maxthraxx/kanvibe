"use client";

import { useEffect, useRef } from "react";

interface TaskContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onBranch: () => void;
  onDelete: () => void;
  hasBranch: boolean;
}

/** 칸반 카드 우클릭 시 표시되는 컨텍스트 메뉴 */
export default function TaskContextMenu({
  x,
  y,
  onClose,
  onBranch,
  onDelete,
  hasBranch,
}: TaskContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[60] min-w-[160px] bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1"
      style={{ left: x, top: y }}
    >
      {!hasBranch && (
        <button
          onClick={onBranch}
          className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
        >
          브랜치 분기
        </button>
      )}
      <button
        onClick={onDelete}
        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
      >
        삭제
      </button>
    </div>
  );
}
