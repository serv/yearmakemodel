'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Chrome } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: '/',
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setIsSent(true);
      toast.success('Magic link sent! Check your email.');
    }
  };

  if (isSent) {
    return (
      <Card className="w-full max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a magic link to <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in your inbox to sign in automatically. If you don't see it, check your spam folder.
          </p>
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2"
            onClick={() => setIsSent(false)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Use Google or your email to sign in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleGoogleSignIn}>
          <Chrome className="w-4 h-4" />
          Sign in with Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button className="w-full" onClick={handleMagicLink} disabled={loading}>
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </CardContent>
    </Card>
  );
}

