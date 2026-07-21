'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Send, LogOut, Crown } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import PaymentModal from '@/components/PaymentModal';

interface Message {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  content: string;
  suggestedReply?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isPremium: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef<User | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
    });

    newSocket.on('authenticated', (user: User) => {
      currentUserRef.current = user;
      setCurrentUser(user);
      newSocket.emit('load-messages');
      setLoading(false);
    });

    newSocket.on('messages-loaded', (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('premium-updated', (data: { isPremium: boolean }) => {
      setCurrentUser((prev) => (prev ? { ...prev, isPremium: data.isPremium } : null));
    });

    newSocket.on('user-became-premium', (data: any) => {
      if (data.userId === currentUserRef.current?.id) {
        setCurrentUser((prev) => (prev ? { ...prev, isPremium: true } : null));
      }
    });

    newSocket.on('auth-error', () => {
      localStorage.removeItem('authToken');
      router.push('/');
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
    });

    newSocket.emit('authenticate', token);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    socket.emit('send-message', { content: inputValue });
    setInputValue('');
  };

  const handleUseSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const latestSuggestion = messages
    .slice()
    .reverse()
    .find((message) => message.suggestedReply);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    socket?.disconnect();
    router.push('/');
  };

  const handleUpgradePremium = () => {
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {currentUser?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{currentUser?.name}</h1>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser?.isPremium && (
              <button
                onClick={handleUpgradePremium}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition font-medium text-sm"
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </button>
            )}
            {currentUser?.isPremium && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="text-6xl">💬</div>
            <h2 className="text-2xl font-bold text-foreground">No messages yet</h2>
            <p className="text-muted-foreground max-w-xs">
              Start a conversation! Send a message to connect with others in real-time.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.userId === currentUser?.id}
              showSuggestedReply={Boolean(message.suggestedReply)}
              // primaryUserIsPremium={currentUser?.isPremium || false}
              onUseSuggestion={handleUseSuggestion}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="bg-card border-t border-border sticky bottom-0">
        <div className="max-w-4xl mx-auto p-4">
          {/* {currentUser?.isPremium && latestSuggestion?.suggestedReply && (
            <button
              type="button"
              onClick={() => handleUseSuggestion(latestSuggestion.suggestedReply!)}
              className="mb-3 text-black inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/20 transition"
            >
              <span className="text-xs">💡</span>
              <span>{latestSuggestion.suggestedReply}</span>
            </button>
          )} */}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          {!currentUser?.isPremium && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Upgrade to Premium to get AI-powered reply suggestions
            </p>
          )}
        </div>
      </footer>

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            socket?.emit('payment-success');
          }}
        />
      )}
    </main>
  );
}
