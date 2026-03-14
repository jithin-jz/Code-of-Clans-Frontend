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
    <div className="relative px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
      {/* Emoji Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 w-full p-4 mb-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-[#000000] rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/80 overflow-hidden h-[380px] flex">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              width="100%"
              height="100%"
              lazyLoadEmojis={true}
              previewConfig={{ showPreview: false }}
              searchDisabled={false}
              skinTonesDisabled={true}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2.5 items-center">
        {/* Emoji Button */}
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          disabled={!user}
          className={`flex items-center justify-center h-8 w-8 min-w-8 rounded-lg transition-all ${
            showPicker
              ? "bg-[#1a1a1a] text-white"
              : "bg-transparent text-neutral-500 hover:text-neutral-300"
          } disabled:opacity-20`}
        >
          {showPicker ? <X size={16} /> : <Smile size={16} />}
        </button>

        {/* Input Wrapper */}
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={user ? "Message..." : "Sign in to chat"}
            disabled={!user}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full bg-[#111] border-[#1a1a1a] focus-visible:border-[#333] rounded-lg px-3 h-8 text-white text-[11px] transition-all placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Send Button */}
        <button
          disabled={!user || !inputMessage.trim()}
          onClick={handleSend}
          className={`flex items-center justify-center h-8 w-8 min-w-8 rounded-lg transition-all ${
            inputMessage.trim()
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-[#111] text-neutral-700"
          } disabled:opacity-10`}
        >
          <Send
            size={14}
            className={inputMessage.trim() ? "translate-x-0.5" : ""}
          />
        </button>
      </div>

      {/* Bottom safety margin for mobile */}
      <div className="h-2 w-full sm:hidden" />
    </div>
  );
};

export default memo(ChatInput);
