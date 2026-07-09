import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../types";
import { useStore } from "../store";

interface CardItemProps {
  boardId: string;
  listId: string;
  card: Card;
  onEdit: () => void;
}

export default function CardItem({ boardId, listId, card, onEdit }: CardItemProps) {
  const deleteCard = useStore((s) => s.deleteCard);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing group"
      onClick={(e) => {
        // Only open edit if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onEdit();
        }
      }}
    >
      <div className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-800 leading-snug flex-1">
            {card.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCard(boardId, listId, card.id);
            }}
            className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            title="Delete card"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {card.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {card.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400">
            {new Date(card.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
