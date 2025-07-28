'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  ExternalLink, 
  Edit, 
  Trash2,
  EyeOff,
  Share2,
  LogOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Node } from '@/types';
import { config } from '@/config';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(true);
  const [deletingNode, setDeletingNode] = useState<string | null>(null);

  const loadNodes = useCallback(async () => {
    try {
      setLoadingNodes(true);
      const response = await apiClient.getNodes();
      
      if (response.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      
      if (response.data) {
        // Handle both null and array responses
        const nodesData = response.data as Node[];
        setNodes(Array.isArray(nodesData) ? nodesData : []);
      } else if (response.error) {
        // Only show error toast for actual errors
        toast({
          title: "Error",
          description: response.error || "Failed to load nodes",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while loading nodes",
        variant: "destructive",
      });
    } finally {
      setLoadingNodes(false);
    }
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // Handle logout error if needed
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadNodes();
    }
  }, [loading, user, loadNodes]);

  const handleDeleteNode = async (nodeId: string) => {
    try {
      setDeletingNode(nodeId);
      const response = await apiClient.deleteNode(nodeId);
      
      if (response.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      
      if (response.data) {
        setNodes(nodes.filter(node => node.id !== nodeId));
        toast({
          title: "Success",
          description: "Node deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete node",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while deleting the node",
        variant: "destructive",
      });
    } finally {
      setDeletingNode(null);
    }
  };

  const handleViewNode = (node: Node) => {
    const baseUrl = config.getBaseUrl();
    window.open(`${baseUrl}/${node.subdomain_name}`, '_blank');
  };

  const handleManageNode = (nodeId: string) => {
    router.push(`/nodes/${nodeId}`);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between node-header-flex">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground font-serif node-header-title">Dashboard</h1>
              <Badge variant="secondary" className="bg-cottage-warm text-cottage-brown">
                {nodes.length} {nodes.length === 1 ? 'Node' : 'Nodes'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 node-header-actions">
              <Button
                onClick={() => router.push('/nodes/create')}
                className="bg-cottage-green hover:bg-cottage-green/90 text-cottage-cream"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Node
              </Button>
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
        {loadingNodes ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cottage-brown"></div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4">
              <ExternalLink className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No nodes yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first link node to get started
            </p>
            <Button
              onClick={() => router.push('/nodes/create')}
              className="bg-cottage-green hover:bg-cottage-green/90 text-cottage-cream"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Node
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map((node) => (
              <Card key={node.id} className="border-cottage-brown/20 bg-cottage-cream hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-cottage-brown">
                      {node.display_name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {node.show_share_button ? (
                        <Badge variant="default" className="text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {node.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-cottage-brown">
                      {config.getBaseUrl()}/{node.subdomain_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Theme: {node.theme}</span>
                    <span>{node.collaborators?.length || 0} collaborators</span>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewNode(node)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageNode(node.id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteNode(node.id)}
                      disabled={deletingNode === node.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingNode === node.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 