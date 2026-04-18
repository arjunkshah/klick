import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DexChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type DexChatStore = {
  messages: DexChatMessage[];
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  updateLastAssistant: (content: string) => void;
  clear: () => void;
};

function id() {
  return crypto.randomUUID();
}

export const useDexChatStore = create<DexChatStore>()(
  persist(
    (set, get) => ({
      messages: [],

      addUserMessage: (content) => {
        const msg: DexChatMessage = {
          id: id(),
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...get().messages, msg] });
      },

      addAssistantMessage: (content) => {
        const msg: DexChatMessage = {
          id: id(),
          role: "assistant",
          content,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [...get().messages, msg] });
      },

      updateLastAssistant: (content) => {
        const msgs = [...get().messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], content };
            set({ messages: msgs });
            return;
          }
        }
      },

      clear: () => set({ messages: [] }),
    }),
    { name: "klick-dex-chat-v1" },
  ),
);
