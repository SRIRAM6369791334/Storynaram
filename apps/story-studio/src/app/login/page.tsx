'use client';

import { LoginForm } from '@/features/auth/login-form';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-primary p-3">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Storynaram Studio</h1>
          <p className="text-sm text-muted-foreground">Sign in to your workspace</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
