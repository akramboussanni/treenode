'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const confirmEmail = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await apiClient.confirmEmail(token!);
      
      if (response.data) {
        setStatus('success');
        setMessage('Your email has been confirmed successfully! You can now log in to your account.');
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to confirm email. Please try again.');
      }
    } catch {
      setStatus('expired');
      setMessage('This confirmation link has expired. Please request a new one.');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      confirmEmail();
    }
  }, [token, confirmEmail]);

  const resendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please register again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResending(true);
      const response = await apiClient.resendConfirmation(email);
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Confirmation email sent! Please check your inbox.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send confirmation email.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while sending the confirmation email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
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
        return 'Email Confirmed!';
      case 'error':
        return 'Confirmation Failed';
      case 'expired':
        return 'Link Expired';
      default:
        return 'Confirming Email...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'success':
        return 'Your email address has been successfully confirmed. You can now log in to your account.';
      case 'error':
        return 'We encountered an error while confirming your email. Please try again or contact support.';
      case 'expired':
        return 'This confirmation link has expired. Please request a new confirmation email.';
      default:
        return 'Please wait while we confirm your email address...';
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
                  Email Confirmed
                </Badge>
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
                >
                  Continue to Login
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/register')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Register
                </Button>
                
                {email && (
                  <>
                    <Separator />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Need a new confirmation email?
                      </p>
                      <Button 
                        onClick={resendConfirmation}
                        disabled={isResending}
                        variant="outline"
                        size="sm"
                        className="bg-cottage-warm hover:bg-cottage-warm/80"
                      >
                        {isResending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Email
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
              Please wait while we load the confirmation page...
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

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmPageContent />
    </Suspense>
  );
} 