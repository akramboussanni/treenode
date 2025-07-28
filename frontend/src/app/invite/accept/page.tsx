'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api';

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth-required' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    // If user is not authenticated, show auth required message
    if (!loading && !user) {
      setStatus('auth-required');
      setMessage('Please log in to accept this invitation');
      return;
    }

    // If user is authenticated, proceed with accepting invitation
    if (user) {
      acceptInvitation(token);
    }
  }, [searchParams, user, loading]);

  const acceptInvitation = async (token: string) => {
    setStatus('loading');
    try {
      const response = await apiClient.acceptInvitation(token);
      
      if (response.data) {
        setStatus('success');
        setMessage('Invitation accepted successfully! You can now access the node.');
        toast({
          title: "Success",
          description: "Invitation accepted successfully!",
        });
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to accept invitation');
        toast({
          title: "Error",
          description: response.error || "Failed to accept invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while accepting the invitation');
      toast({
        title: "Error",
        description: "An error occurred while accepting the invitation",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    const token = searchParams.get('token');
    if (token) {
      router.push(`/login?redirect=/invite/accept?token=${token}`);
    } else {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Loading</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Processing Invitation</h1>
          <p className="text-muted-foreground">Please wait while we verify your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : status === 'auth-required' ? (
              <LogIn className="h-12 w-12 text-cottage-brown" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle>
            {status === 'success' ? 'Invitation Accepted!' : 
             status === 'auth-required' ? 'Authentication Required' : 
             'Invitation Error'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'auth-required' ? (
            <Button
              onClick={handleLogin}
              className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log In to Accept
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
            >
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 