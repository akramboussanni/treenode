'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

function AcceptInvitationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  const acceptInvitation = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await apiClient.acceptInvitation(token!);
      
      if (response.data) {
        setStatus('success');
        setMessage('Invitation accepted successfully! You can now access the shared node.');
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to accept invitation. Please try again.');
      }
    } catch {
      setStatus('expired');
      setMessage('This invitation link has expired. Please request a new one.');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      acceptInvitation();
    }
  }, [token, acceptInvitation]);

  const resendInvitation = async () => {
    toast({
      title: "Info",
      description: "Please contact the node owner to request a new invitation.",
    });
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-cottage-green" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-destructive" />;
      default:
        return <Mail className="h-16 w-16 text-cottage-brown" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Invitation Accepted!';
      case 'error':
        return 'Acceptance Failed';
      case 'expired':
        return 'Link Expired';
      default:
        return 'Accepting Invitation...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'You have successfully accepted the invitation. You can now access the shared node.';
      case 'error':
        return 'We encountered an error while accepting the invitation. Please try again or contact support.';
      case 'expired':
        return 'This invitation link has expired. Please request a new invitation.';
      default:
        return 'Please wait while we process your invitation...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-cottage-brown/20 bg-cottage-cream shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-cottage-brown">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cottage-brown"></div>
              </div>
            )}

            {message && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Badge variant="default" className="w-full justify-center bg-cottage-green text-cottage-cream">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Invitation Accepted
                </Badge>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
                
                {token && (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Need a new invitation?
                      </p>
                      <Button 
                        onClick={resendInvitation}
                        disabled={false} // Removed isResending
                        variant="outline"
                        size="sm"
                        className="bg-cottage-warm hover:bg-cottage-warm/80"
                      >
                        {false ? ( // Removed isResending
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Request New Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="text-center">
              <Button 
                onClick={() => router.push('/')}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-cottage-brown/20 bg-cottage-cream shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-cottage-brown" />
            </div>
            <CardTitle className="text-2xl font-bold text-cottage-brown">
              Loading...
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we load the invitation page...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cottage-brown"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationPageContent />
    </Suspense>
  );
} 