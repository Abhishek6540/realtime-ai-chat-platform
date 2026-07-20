'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { MessageCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/chat');
    }
  }, [router]);

  const handleGoogleSuccess = (credentialResponse: any) => {
    localStorage.setItem('authToken', credentialResponse.credential);
    router.push('/chat');
  };

  if (!mounted) return null;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <main className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Chat Pro</h1>
            <p className="text-muted-foreground text-lg">
              Real-time conversations with AI-powered suggestions
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <div className="text-accent mt-1">⚡</div>
              <div>
                <p className="font-semibold text-foreground">Real-time Messaging</p>
                <p className="text-sm text-muted-foreground">Instant delivery to all connected users</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <div className="text-accent mt-1">✨</div>
              <div>
                <p className="font-semibold text-foreground">AI Suggestions</p>
                <p className="text-sm text-muted-foreground">Smart reply suggestions for premium members</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <div className="text-accent mt-1">🔐</div>
              <div>
                <p className="font-semibold text-foreground">Secure & Private</p>
                <p className="text-sm text-muted-foreground">OAuth 2.0 authentication with secure WebSockets</p>
              </div>
            </div>
          </div>

          {/* Google Login */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              By logging in, you agree to our Terms of Service
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full h-40 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      </main>
    </GoogleOAuthProvider>
  );
}
