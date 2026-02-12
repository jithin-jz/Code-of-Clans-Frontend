import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Loader2, Send, ShieldAlert } from "lucide-react";
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-white tracking-tight">
            System Announcements
          </h2>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Message Content
            </label>
            <Textarea
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-950 border-zinc-800 h-40 focus:border-zinc-700 transition-colors text-white rounded-lg p-4 placeholder:text-zinc-700 leading-relaxed resize-none"
            />
          </div>

          <Button
            onClick={handleSendBroadcast}
            className="w-full h-10 bg-white text-black hover:bg-zinc-200 font-medium gap-2 rounded-md transition-colors"
            disabled={sending}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span className="text-sm">
              {sending ? "Sending..." : "Send Announcement"}
            </span>
          </Button>

          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-500 leading-relaxed text-center font-medium">
            <span className="text-zinc-400 font-bold uppercase tracking-tighter mr-1">
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
