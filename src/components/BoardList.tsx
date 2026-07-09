import { useState } from "react";
import { Board } from "../types";

interface BoardListProps {
  boards: Board[];
  onSelectBoard: (id: string) => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, title: string) => void;
}

export default function BoardList({
  boards,
  onSelectBoard,
  onDeleteBoard,
  onRenameBoard,
}: BoardListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startRename = (board: Board) => {
    setEditingId(board.id);
    setEditTitle(board.title);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameBoard(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">No boards yet</h2>
        <p className="text-sm text-gray-500 mb-6">Create your first board to get started</p>
        <p className="text-xs text-gray-400">Click "New Board" in the top right</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {boards.map((board) => (
          <div
            key={board.id}
            className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => onSelectBoard(board.id)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                {editingId === board.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={saveRename}
                    onClick={(e) => e.stopPropagation()}
                    className="text-base font-medium text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent px-0 py-0.5 w-full"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="text-base font-medium text-gray-900 group-hover:text-indigo-700 transition-colors"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRename(board);
                    }}
                  >
                    {board.title}
                  </h3>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(board);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title="Rename"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${board.title}"?`)) onDeleteBoard(board.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>{board.lists.length} {board.lists.length === 1 ? "list" : "lists"}</span>
                <span>
                  {board.lists.reduce((sum, l) => sum + l.cards.length, 0)}{" "}
                  {board.lists.reduce((sum, l) => sum + l.cards.length, 0) === 1 ? "card" : "cards"}
                </span>
                <span>{new Date(board.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
