import React, { memo } from 'react';
import { Send, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const ChatInput = ({ 
    user, 
    sendMessage, 
    showPicker, 
    setShowPicker, 
    inputRef, 
    pickerRef,
    emojiButtonRef
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
        <div className="relative p-3 bg-gradient-to-t from-[#0a0a0a] to-transparent border-t border-white/5">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Emoji Picker */}
            {showPicker && (
                <div 
                    ref={pickerRef}
                    className="absolute bottom-full left-0 w-full p-3 mb-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="bg-[#141414] rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden h-[350px] flex">
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
                            ? 'bg-[#FFD700] text-black shadow-lg shadow-yellow-900/30' 
                            : 'bg-white/5 text-gray-500 hover:text-[#FFD700] hover:bg-white/10'
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-white/5 border-0 rounded-xl px-4 h-10 text-white text-sm focus-visible:ring-1 focus-visible:ring-[#FFD700]/30 focus-visible:bg-white/[0.07] transition-all disabled:opacity-30 placeholder:text-gray-600" 
                />
                
                {/* Send Button */}
                <Button 
                    disabled={!user || !inputMessage.trim()} 
                    onClick={handleSend}
                    className={`p-2.5 rounded-xl transition-all duration-200 h-10 w-10 ${
                        inputMessage.trim() 
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black shadow-lg shadow-yellow-900/30 hover:scale-105 active:scale-95' 
                            : 'bg-white/5 text-gray-600'
                    } disabled:opacity-30 disabled:cursor-not-allowed border-0`}
                >
                    <Send size={16} />
                </Button>
            </div>
            
            {/* Keyboard shortcut hint */}
            <p className="text-center text-[9px] text-gray-600 mt-2">
                Press <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500 font-mono">Ctrl+B</kbd> to toggle
            </p>
        </div>
    );
};

export default memo(ChatInput);
