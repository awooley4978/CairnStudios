import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Board } from "../types";
import { useStore } from "../store";
import ListColumn from "./ListColumn";

interface BoardViewProps {
  board: Board;
}

export default function BoardView({ board }: BoardViewProps) {
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addList = useStore((s) => s.addList);
  const moveCard = useStore((s) => s.moveCard);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeIdStr = active.id as string;
      const overIdStr = over.id as string;

      // Check if this is a card being dragged
      for (const list of board.lists) {
        const cardInList = list.cards.find((c) => c.id === activeIdStr);
        if (cardInList) {
          // Find target list
          let targetListId = overIdStr;
          let targetIndex = 0;

          // If dropped on a card, find which list that card belongs to
          for (const targetList of board.lists) {
            const overIndex = targetList.cards.findIndex(
              (c) => c.id === overIdStr
            );
            if (overIndex !== -1) {
              targetListId = targetList.id;
              targetIndex = overIndex;
              break;
            }
          }

          // If dropped on a list itself
          const listExists = board.lists.find((l) => l.id === targetListId);
          if (listExists && targetListId !== list.id) {
            targetIndex = listExists.cards.length;
          }

          moveCard(board.id, list.id, targetListId, cardInList.id, targetIndex);
          return;
        }
      }
    },
    [board, moveCard]
  );

  const handleAddList = () => {
    if (newListTitle.trim()) {
      addList(board.id, newListTitle.trim());
      setNewListTitle("");
      setShowNewList(false);
    }
  };

  const listIds = board.lists.map((l) => l.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-6 h-full items-start min-w-max">
          <SortableContext
            items={listIds}
            strategy={horizontalListSortingStrategy}
          >
            {board.lists.map((list) => (
              <ListColumn
                key={list.id}
                boardId={board.id}
                list={list}
                isDragging={activeId === list.id}
              />
            ))}
          </SortableContext>

          {/* Add list button */}
          <div className="w-72 shrink-0">
            {showNewList ? (
              <div className="bg-gray-100/80 rounded-xl p-3 border border-dashed border-gray-300">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddList();
                    if (e.key === "Escape") {
                      setShowNewList(false);
                      setNewListTitle("");
                    }
                  }}
                  placeholder="List name..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-2"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddList}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewList(false);
                      setNewListTitle("");
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewList(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl border border-dashed border-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add List
              </button>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
