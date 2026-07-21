'use client';

import { Lightbulb } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  content: string;
  suggestedReply?: string;
  createdAt: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  showSuggestedReply: boolean;
  onUseSuggestion?: (text: string) => void;
}

export default function ChatMessage({
  message,
  isCurrentUser,
  showSuggestedReply,
  onUseSuggestion,
}: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={`flex gap-3 ${isCurrentUser ? 'flex-row justify-end' : 'flex-row justify-start'}`}
    >
      <div className="flex-shrink-0 mt-1">
        {message.avatar ? (
          <Image
            src={message.avatar}
            alt={message.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shadow-sm">
            <span className="text-sm font-semibold text-primary">
              {message.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end text-right' : 'items-start text-left'}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{message.name}</p>
          <p className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</p>
        </div>

        <div
          className={`max-w-[500px] px-4 py-3 rounded-3xl shadow-sm border ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground border-primary/20 rounded-br-none rounded-tl-3xl '
              : 'bg-card text-foreground border-border/70 rounded-bl-none rounded-tr-3xl '
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>

        {showSuggestedReply && message.suggestedReply && !isCurrentUser && (
          <div className="mt-2 max-w-[500px] p-3 bg-gray border border-accent/30 rounded-2xl shadow-md">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-black font-semibold text-accent mb-2">AI Suggested Reply</p>
                <p className="text-xs text-foreground leading-relaxed mb-3">{message.suggestedReply}</p>
                <button
                  type="button"
                  onClick={() => onUseSuggestion?.(message.suggestedReply || "")}
                  className="inline-flex text-red-500 cursor-pointer items-center gap-2 rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-[11px] font-semibold text-accent transition hover:bg-accent/30"
                >
                  Use reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
