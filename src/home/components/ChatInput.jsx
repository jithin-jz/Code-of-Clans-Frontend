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
    <div className="relative p-3 bg-linear-to-t from-[#1a1a1a] to-transparent border-t border-[#3a3a3a]">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#444444] to-transparent" />

      {/* Emoji Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 w-full p-3 mb-1 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="bg-[#262626] rounded-xl border border-[#444444] shadow-2xl shadow-black/50 overflow-hidden h-[350px] flex">
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
          className={`p-2.5 rounded-xl transition-all duration-200 ${
            showPicker
              ? "bg-[#ffa116] text-white shadow-lg shadow-[#ffa116]/35"
              : "bg-[#2d2d2d] text-slate-300 hover:text-[#ffa116] hover:bg-[#373737]"
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
          className="flex-1 bg-[#2b2b2b] border border-[#3a3a3a] rounded-xl px-4 h-10 text-white text-sm focus-visible:ring-1 focus-visible:ring-[#ffa116]/40 focus-visible:bg-[#323232] transition-all disabled:opacity-30 placeholder:text-slate-400"
        />

        {/* Send Button */}
        <Button
          disabled={!user || !inputMessage.trim()}
          onClick={handleSend}
          className={`p-2.5 rounded-xl transition-all duration-200 h-10 w-10 ${
            inputMessage.trim()
              ? "bg-linear-to-r from-[#00af9b] to-[#008f7a] text-white shadow-lg shadow-[#008f7a]/35 hover:scale-105 active:scale-95"
              : "bg-[#2d2d2d] text-slate-500"
          } disabled:opacity-30 disabled:cursor-not-allowed border-0`}
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Minimal footer spacing for cleaner layout */}
      <div className="h-1" />
    </div>
  );
};

export default memo(ChatInput);
