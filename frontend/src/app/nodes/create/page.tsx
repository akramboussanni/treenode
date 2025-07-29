'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Plus, 
  Globe, 
  Check,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { Node } from '@/types';
import { config } from '@/config';

const createNodeSchema = z.object({
  subdomainName: z.string().min(1, 'Subdomain name is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens are allowed'),
});

type CreateNodeFormData = z.infer<typeof createNodeSchema>;

export default function CreateNodePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdNode, setCreatedNode] = useState<Node | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // Handle logout error if needed
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateNodeFormData>({
    resolver: zodResolver(createNodeSchema),
  });

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleCreateNode = async (data: CreateNodeFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiClient.createNode(data.subdomainName);
      
      if (response.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      
      if (response.data) {
        setCreatedNode(response.data as Node);
        setIsSuccess(true);
        toast({
          title: "Success",
          description: "Node created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create node",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while creating the node",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewNode = () => {
    if (createdNode) {
      const baseUrl = config.getBaseUrl();
      window.open(`${baseUrl}/${createdNode.subdomain_name}`, '_blank');
    }
  };

  const handleManageNode = () => {
    if (createdNode) {
      router.push(`/nodes/${createdNode.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (isSuccess && createdNode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Create Link Node</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-cottage-green/20 bg-cottage-cream">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Check className="h-12 w-12 text-cottage-green" />
                </div>
                <CardTitle className="text-cottage-green text-2xl">Node Created Successfully!</CardTitle>
                <CardDescription>
                  Your link node is now live and ready to be customized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">Your node is available at:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xl font-mono text-cottage-brown">
                      {config.getBaseUrl()}/{createdNode.subdomain_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleViewNode}
                    className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream btn-hover-scale"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    View Node
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleManageNode}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Node
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between node-header-flex">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground font-serif node-header-title">Create Link Node</h1>
            </div>
            <div className="flex items-center space-x-2 node-header-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-cottage-brown/20 bg-cottage-cream">
            <CardHeader>
              <CardTitle className="text-cottage-brown">Create Your Link Node</CardTitle>
              <CardDescription>
                Choose a unique subdomain name for your link node. This will be your node&apos;s URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleCreateNode)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subdomainName">Subdomain Name</Label>
                  <Input
                    id="subdomainName"
                    {...register('subdomainName')}
                    placeholder="my-awesome-links"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be your URL: {config.getBaseUrl()}/{watch('subdomainName') || '[subdomain-name]'}
                  </p>
                  {errors.subdomainName && (
                    <p className="text-sm text-destructive">{errors.subdomainName.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-cottage-green hover:bg-cottage-green/90 text-cottage-cream"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Node
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 