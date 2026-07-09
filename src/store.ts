import { create } from "zustand";
import { Board, List, Card } from "./types";
import { generateId } from "./utils/id";

const STORAGE_KEY = "flowboard-data";

function loadBoards(): Board[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveBoards(boards: Board[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch {}
}

interface FlowBoardState {
  boards: Board[];
  activeBoardId: string | null;

  // Board actions
  createBoard: (title: string) => string;
  renameBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string | null) => void;

  // List actions
  addList: (boardId: string, title: string) => void;
  renameList: (boardId: string, listId: string, title: string) => void;
  deleteList: (boardId: string, listId: string) => void;
  reorderLists: (boardId: string, lists: List[]) => void;

  // Card actions
  addCard: (boardId: string, listId: string, title: string) => void;
  updateCard: (boardId: string, listId: string, cardId: string, updates: Partial<Card>) => void;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  moveCard: (boardId: string, fromListId: string, toListId: string, cardId: string, toIndex: number) => void;
}

export const useStore = create<FlowBoardState>((set) => ({
  boards: loadBoards(),
  activeBoardId: null,

  createBoard: (title) => {
    const id = generateId();
    const board: Board = {
      id,
      title: title || "Untitled Board",
      lists: [
        { id: generateId(), title: "Backlog", cards: [] },
        { id: generateId(), title: "In Progress", cards: [] },
        { id: generateId(), title: "Done", cards: [] },
      ],
      createdAt: Date.now(),
    };
    set((state) => {
      const boards = [...state.boards, board];
      saveBoards(boards);
      return { boards, activeBoardId: id };
    });
    return id;
  },

  renameBoard: (boardId, title) => {
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === boardId ? { ...b, title } : b
      );
      saveBoards(boards);
      return { boards };
    });
  },

  deleteBoard: (boardId) => {
    set((state) => {
      const boards = state.boards.filter((b) => b.id !== boardId);
      saveBoards(boards);
      return {
        boards,
        activeBoardId:
          state.activeBoardId === boardId ? null : state.activeBoardId,
      };
    });
  },

  setActiveBoard: (boardId) => set({ activeBoardId: boardId }),

  addList: (boardId, title) => {
    const newList: List = { id: generateId(), title, cards: [] };
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === boardId ? { ...b, lists: [...b.lists, newList] } : b
      );
      saveBoards(boards);
      return { boards };
    });
  },

  renameList: (boardId, listId, title) => {
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === boardId
          ? {
              ...b,
              lists: b.lists.map((l) =>
                l.id === listId ? { ...l, title } : l
              ),
            }
          : b
      );
      saveBoards(boards);
      return { boards };
    });
  },

  deleteList: (boardId, listId) => {
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === boardId
          ? { ...b, lists: b.lists.filter((l) => l.id !== listId) }
          : b
      );
      saveBoards(boards);
      return { boards };
    });
  },

  reorderLists: (boardId, lists) => {
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === boardId ? { ...b, lists } : b
      );
      saveBoards(boards);
      return { boards };
    });
  },

  addCard: (boardId, listId, title) => {
    const card: Card = {
      id: generateId(),
      title,
      description: "",
      createdAt: Date.now(),
    };
    set((state) => {
      const boards = state.boards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map((l) =>
            l.id === listId ? { ...l, cards: [...l.cards, card] } : l
          ),
        };
      });
      saveBoards(boards);
      return { boards };
    });
  },

  updateCard: (boardId, listId, cardId, updates) => {
    set((state) => {
      const boards = state.boards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map((l) => {
            if (l.id !== listId) return l;
            return {
              ...l,
              cards: l.cards.map((c) =>
                c.id === cardId ? { ...c, ...updates } : c
              ),
            };
          }),
        };
      });
      saveBoards(boards);
      return { boards };
    });
  },

  deleteCard: (boardId, listId, cardId) => {
    set((state) => {
      const boards = state.boards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map((l) => {
            if (l.id !== listId) return l;
            return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
          }),
        };
      });
      saveBoards(boards);
      return { boards };
    });
  },

  moveCard: (boardId, fromListId, toListId, cardId, toIndex) => {
    set((state) => {
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return state;

      const fromList = board.lists.find((l) => l.id === fromListId);
      if (!fromList) return state;

      const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = fromList.cards[cardIndex];

      const boards = state.boards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map((l) => {
            if (l.id === fromListId) {
              return {
                ...l,
                cards: l.cards.filter((c) => c.id !== cardId),
              };
            }
            if (l.id === toListId) {
              const newCards = [...l.cards];
              newCards.splice(toIndex, 0, card);
              return { ...l, cards: newCards };
            }
            return l;
          }),
        };
      });
      saveBoards(boards);
      return { boards };
    });
  },
}));
