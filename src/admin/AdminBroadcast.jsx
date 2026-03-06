import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Send } from "lucide-react";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";

const AdminBroadcast = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = () => {
    if (!message.trim()) {
      notify.error("Please enter a message");
      return;
    }

    notify.warning("System Announcement", {
      description:
        "Are you sure you want to send this announcement to ALL users?",
      action: {
        label: "Send",
        onClick: () => confirmSendBroadcast(),
      },
    });
  };

  const confirmSendBroadcast = async () => {
    setSending(true);
    try {
      await authAPI.sendBroadcast(message);
      notify.success("Announcement sent successfully");
      setMessage("");
    } catch {
      notify.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
            System Announcements
          </h2>
        </div>

        <div className="p-4 sm:p-6 rounded-xl border border-white/5 bg-[#0a0a0a] shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              Message Content
            </label>
            <Textarea
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/[0.04] border-white/10 h-32 sm:h-40 focus:border-white/20 transition-colors text-white rounded-lg p-4 placeholder:text-neutral-600 leading-relaxed resize-none"
            />
          </div>

          <Button
            onClick={handleSendBroadcast}
            className="w-full h-10 bg-white text-black hover:bg-zinc-200 font-medium gap-2 rounded-md transition-colors"
            disabled={sending}
          >
            {!sending ? <Send size={16} /> : null}
            <span className="text-sm">
              {sending ? "Sending..." : "Send Announcement"}
            </span>
          </Button>

          <div className="p-3 rounded-lg border border-white/10 bg-[#0a1220] text-[10px] text-neutral-500 leading-relaxed text-center font-medium">
            <span className="text-neutral-300 font-bold uppercase tracking-tighter mr-1">
              Note:
            </span>
            This announcement will be delivered immediately to all active user
            sessions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
