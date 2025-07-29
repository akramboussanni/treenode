'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { config } from '@/config';

export default function LinkRedirectPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<{ link?: string } | null>(null);

  const nodeName = params.name as string;
  const linkName = params.link as string;

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch link data from the API
        const response = await fetch(`${config.backendUrl}/nodes/public/subdomain/${nodeName}/links/${linkName}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Link not found');
          } else {
            setError('Failed to load link data');
          }
          return;
        }

        const data = await response.json() as { link?: string };
        setLinkData(data);

        // If the link has a URL, redirect to it
        if (data.link && data.link.trim() !== '') {
          const linkUrl = data.link;
          // Small delay to show loading state briefly
          setTimeout(() => {
            window.location.href = linkUrl;
          }, 500);
        } else {
          // If no URL, show error
          setError('This link has no destination URL');
        }
      } catch (err) {
        console.error('Error fetching link data:', err);
        setError('Failed to load link data');
      } finally {
        setLoading(false);
      }
    };

    if (nodeName && linkName) {
      fetchAndRedirect();
    }
  }, [nodeName, linkName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cottage-cream to-cottage-warm flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-cottage-brown">Redirecting...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cottage-brown mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Redirecting you to the destination...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cottage-cream to-cottage-warm flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-cottage-brown">Link Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'The requested link could not be found.'}
            </p>
            <Button 
              onClick={() => window.history.back()} 
              className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should rarely be shown as the redirect should happen quickly
  return (
    <div className="min-h-screen bg-gradient-to-br from-cottage-cream to-cottage-warm flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-cottage-brown">Redirecting...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            If you are not redirected automatically, click the button below.
          </p>
          <Button 
            onClick={() => linkData.link && (window.location.href = linkData.link)}
            className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
          >
            Continue to Destination
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 