import { create } from "zustand";

const WS_URL = import.meta.env.VITE_CHAT_URL;

const useChatStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  messages: [],
  onlineCount: 0,
  error: null,
  
  // Actions
  connect: (token) => {
    // Prevent multiple connections
    if (get().socket?.readyState === WebSocket.OPEN) return;
    
    // Create new WebSocket connection
    // We pass the token as a query param or header if possible, 
    // but standard WebSocket API connects via URL.
    // The backend expects `?token=<jwt>` or a ticket system.
    // Assuming backend extracts from query param for now as standardized in previous steps.
    const wsUrl = `${WS_URL}/global?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ isConnected: true, error: null });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'chat_message') {
            set((state) => ({
                messages: [...state.messages, data]
            }));
        } else if (data.type === 'history') {
             set({ messages: data.messages });
        } else if (data.type === 'presence') {
             set({ onlineCount: data.count });
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onclose = (event) => {
      console.log("WS Close:", event.code, event.reason);
      set({ isConnected: false, socket: null });
      // Optional: data.code === 1008 (Policy Violation) -> Auth failed
      if (event.code === 1008) {
          console.error("WS Auth Failed (1008)");
          set({ error: "Authentication failed" });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      set({ isConnected: false, error: "Connection error" });
    };

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (content) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      const payload = {
          type: "chat_message",
          message: content
      };
      socket.send(JSON.stringify(payload));
    } else {
        console.error("Cannot send message: Socket not connected");
    }
  },

  clearMessages: () => set({ messages: [] })
}));

export default useChatStore;
