import { useState } from "react";
import { useStore } from "./store";
import BoardList from "./components/BoardList";
import BoardView from "./components/BoardView";

export default function App() {
  const { boards, activeBoardId } = useStore();
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const createBoard = useStore((s) => s.createBoard);

  const handleCreateBoard = () => {
    const title = newBoardTitle.trim();
    createBoard(title || "Untitled Board");
    setNewBoardTitle("");
    setShowNewBoardInput(false);
  };

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {activeBoardId && (
            <button
              onClick={() => useStore.getState().setActiveBoard(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -ml-1"
              title="Back to boards"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {activeBoard ? activeBoard.title : "FlowBoard"}
          </h1>
          {!activeBoard && (
            <span className="text-xs text-gray-400 font-normal ml-1">
              {boards.length} {boards.length === 1 ? "board" : "boards"}
            </span>
          )}
        </div>

        {!activeBoard && (
          <div className="flex items-center gap-2">
            {showNewBoardInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                  placeholder="Board name..."
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-48"
                  autoFocus
                />
                <button
                  onClick={handleCreateBoard}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewBoardInput(false);
                    setNewBoardTitle("");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewBoardInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Board
              </button>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {activeBoard ? (
          <BoardView board={activeBoard} />
        ) : (
          <BoardList
            boards={boards}
            onSelectBoard={(id) => useStore.getState().setActiveBoard(id)}
            onDeleteBoard={(id) => useStore.getState().deleteBoard(id)}
            onRenameBoard={(id, title) => useStore.getState().renameBoard(id, title)}
          />
        )}
      </main>
    </div>
  );
}
