import { create } from "zustand";

const WS_URL =
  import.meta.env.VITE_CHAT_URL ||
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws/chat`;

const useChatStore = create((set, get) => ({
  // State
  socket: null,
  isConnected: false,
  messages: [],
  onlineCount: 0,
  error: null,
  
  // Actions
  connect: () => {
    const { socket: existingSocket } = get();
    
    // Prevent multiple connections
    if (existingSocket) {
      if (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING) {
        return;
      }
      // Close stale socket
      existingSocket.close();
    }
    
    const wsUrl = `${WS_URL}/global`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ isConnected: true, error: null });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message') {
            set((state) => {
                // De-duplication check: if message with same ID or same content/user/timestamp exists
                // We use a looser check for messages without IDs
                const isDuplicate = state.messages.some(msg => {
                    if (data.id && msg.id === data.id) return true;
                    
                    const msgTime = new Date(msg.timestamp).getTime();
                    const dataTime = new Date(data.timestamp).getTime();
                    const isTimeClose = Math.abs(msgTime - dataTime) < 1000;

                    return msg.message === data.message && 
                           msg.user_id === data.user_id && 
                           isTimeClose;
                });
                
                if (isDuplicate) {
                    return state;
                }

                return {
                    messages: [...state.messages, data]
                };
            });
        } else if (data.type === 'history') {
             set({ messages: data.messages });
        } else if (data.type === 'presence') {
             set({ onlineCount: data.count });
        } else if (data.type === 'error') {
             set({ error: data.message });
             setTimeout(() => set({ error: null }), 3000);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onclose = (event) => {
      set({ isConnected: false, socket: null });
      if (event.code === 1008) {
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
      set({ socket: null, isConnected: false, messages: [] });
    }
  },

  sendMessage: (content) => {
    const { socket, isConnected } = get();
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      const payload = {
          type: "chat_message",
          message: content
      };
      socket.send(JSON.stringify(payload));
    } else {
        console.error("Cannot send message: Socket not open", socket?.readyState);
    }
  },

  clearMessages: () => set({ messages: [] })
}));

export default useChatStore;
