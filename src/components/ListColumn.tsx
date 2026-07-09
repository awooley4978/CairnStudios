import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { List } from "../types";
import { useStore } from "../store";
import CardItem from "./CardItem";
import CardDialog from "./CardDialog";

interface ListColumnProps {
  boardId: string;
  list: List;
  isDragging?: boolean;
}

export default function ListColumn({ boardId, list, isDragging }: ListColumnProps) {
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [cardDialog, setCardDialog] = useState<{
    listId: string;
    cardId: string;
  } | null>(null);

  const addCard = useStore((s) => s.addCard);
  const renameList = useStore((s) => s.renameList);
  const deleteList = useStore((s) => s.deleteList);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardIds = list.cards.map((c) => c.id);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(boardId, list.id, newCardTitle.trim());
      setNewCardTitle("");
      setShowNewCard(false);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      renameList(boardId, list.id, editTitle.trim());
    }
    setEditingTitle(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 shrink-0 bg-gray-100/60 rounded-xl flex flex-col max-h-full"
      >
        {/* Column header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0 touch-none"
              title="Drag to reorder"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              </svg>
            </button>

            {editingTitle ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                onBlur={handleSaveTitle}
                className="text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                autoFocus
              />
            ) : (
              <h3
                className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-indigo-700 transition-colors truncate"
                onClick={() => setEditingTitle(true)}
                title="Click to rename"
              >
                {list.title}
              </h3>
            )}

            <span className="text-xs text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded-full shrink-0">
              {list.cards.length}
            </span>
          </div>

          <button
            onClick={() => {
              if (confirm(`Delete list "${list.title}"?`)) deleteList(boardId, list.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors shrink-0"
            title="Delete list"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto column-scroll px-3 pb-2 space-y-2">
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {list.cards.map((card) => (
              <CardItem
                key={card.id}
                boardId={boardId}
                listId={list.id}
                card={card}
                onEdit={() => setCardDialog({ listId: list.id, cardId: card.id })}
              />
            ))}
          </SortableContext>

          {list.cards.length === 0 && !showNewCard && (
            <div className="text-xs text-gray-400 text-center py-6">
              No cards yet
            </div>
          )}

          {/* New card input */}
          {showNewCard ? (
            <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
              <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCard();
                  }
                  if (e.key === "Escape") {
                    setShowNewCard(false);
                    setNewCardTitle("");
                  }
                }}
                placeholder="Card title..."
                className="w-full text-sm border-0 outline-none resize-none bg-transparent placeholder-gray-400 min-h-[36px]"
                rows={2}
                autoFocus
              />
              <div className="flex items-center justify-between mt-1">
                <button
                  onClick={handleAddCard}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewCard(false);
                    setNewCardTitle("");
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCard(true)}
              className="w-full flex items-center gap-1.5 px-2 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Card
            </button>
          )}
        </div>
      </div>

      {/* Card detail dialog */}
      {cardDialog && (
        <CardDialog
          boardId={boardId}
          listId={cardDialog.listId}
          cardId={cardDialog.cardId}
          onClose={() => setCardDialog(null)}
        />
      )}
    </>
  );
}
