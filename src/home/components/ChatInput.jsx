import React, { memo } from "react";
import { Send, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const ChatInput = ({
  user,
  sendMessage,
  showPicker,
  setShowPicker,
  inputRef,
  pickerRef,
  emojiButtonRef,
}) => {
  const [inputMessage, setInputMessage] = React.useState("");

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="relative p-3 bg-[#111d30]/95 border-t border-white/10">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#7ea3d9]/30 to-transparent" />

      {/* Emoji Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 w-full p-3 mb-1 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="bg-[#162338] rounded-xl border border-white/15 shadow-2xl shadow-black/50 overflow-hidden h-[350px] flex">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width="100%"
              height="100%"
              lazyLoadEmojis={true}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center">
        {/* Emoji Button */}
        <Button
          ref={emojiButtonRef}
          variant="ghost"
          onClick={() => setShowPicker(!showPicker)}
          disabled={!user}
          className={`p-2.5 rounded-xl transition-all duration-200 ${showPicker
              ? "bg-[#ffa116] text-white shadow-lg shadow-[#ffa116]/35"
              : "bg-[#162338] text-slate-300 hover:text-[#ffa116] hover:bg-[#1e2f47]"
            } disabled:opacity-30 border-0 h-10 w-10`}
        >
          {showPicker ? <X size={18} /> : <Smile size={18} />}
        </Button>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={user ? "Type a message..." : "Login to chat..."}
          disabled={!user}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-[#162338] border border-white/15 rounded-xl px-4 h-10 text-white text-sm focus-visible:ring-1 focus-visible:ring-[#00af9b]/40 focus-visible:bg-[#1a2d44] transition-all disabled:opacity-30 placeholder:text-slate-500"
        />

        {/* Send Button */}
        <Button
          disabled={!user || !inputMessage.trim()}
          onClick={handleSend}
          className={`p-2.5 rounded-xl transition-all duration-200 h-10 w-10 ${inputMessage.trim()
              ? "bg-[#00af9b] text-white shadow-lg shadow-[#00af9b]/30 hover:bg-[#00c4ad] hover:scale-105 active:scale-95"
              : "bg-[#162338] text-slate-500 hover:text-slate-400"
            } disabled:opacity-30 disabled:cursor-not-allowed border-0`}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default memo(ChatInput);
