'use client';

import { MessageCircle, Lightbulb } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  suggestedReply?: string;
  createdAt: string;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  showSuggestedReply: boolean;
}

export default function ChatMessage({
  message,
  isCurrentUser,
  showSuggestedReply,
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
      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {message.userAvatar ? (
          <Image
            src={message.userAvatar}
            alt={message.userName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {message.userName?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{message.userName}</p>
          <p className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</p>
        </div>

        {/* Message Bubble */}
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-card border border-border text-foreground rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>

        {/* Suggested Reply */}
        {showSuggestedReply && message.suggestedReply && !isCurrentUser && (
          <div className="mt-2 max-w-xs lg:max-w-md p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-accent mb-1">AI Suggestion</p>
                <p className="text-xs text-foreground leading-relaxed">{message.suggestedReply}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
