'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Link, Settings, LogOut, User, Globe, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Node } from '@/types';
import { useState } from 'react';
import { config } from '@/config';

interface SharedNodeGroup {
  owner_id: string;
  owner_name: string;
  nodes: Node[];
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [sharedNodes, setSharedNodes] = useState<SharedNodeGroup[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(true);
  const [loadingSharedNodes, setLoadingSharedNodes] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      loadNodes();
    }
  }, [user]);

  const loadNodes = async () => {
    try {
      setLoadingNodes(true);
      setLoadingSharedNodes(true);
      
      const [nodesResponse, sharedNodesResponse] = await Promise.all([
        apiClient.getNodes(),
        apiClient.getSharedNodes(),
      ]);
      
      if (nodesResponse.data) {
        setNodes(nodesResponse.data as Node[]);
      }
      
      if (sharedNodesResponse.data) {
        setSharedNodes(sharedNodesResponse.data as SharedNodeGroup[]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your nodes",
        variant: "destructive",
      });
    } finally {
      setLoadingNodes(false);
      setLoadingSharedNodes(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleCreateNode = () => {
    router.push('/nodes/create');
  };

  const handleViewNode = (nodeId: string) => {
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
              >
                <h1 className="text-2xl font-bold text-foreground">Treenode</h1>
              </button>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-4">
              Welcome back, {user.username}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your link nodes and create beautiful online presences
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground font-serif">Dashboard</h2>
              <p className="text-muted-foreground">
                Create a new link node or manage your existing ones
              </p>
            </div>
            <Button
              onClick={handleCreateNode}
              className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Node
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Nodes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-foreground font-serif">Your Link Nodes</h3>
              <Badge variant="outline">{nodes.length} nodes</Badge>
            </div>

            {loadingNodes ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading your nodes...</p>
              </div>
            ) : nodes.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No nodes yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Create your first link node to get started
                  </p>
                  <Button onClick={handleCreateNode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Node
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {nodes.map((node) => (
                  <Card key={node.id} className="card-hover-lift">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{node.display_name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNode(node.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        {config.getBaseUrl()}/{node.subdomain_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(node.created_at * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`${config.getBaseUrl()}/${node.subdomain_name}`, '_blank')}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          View Node
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewNode(node.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Shared Nodes Section */}
          {sharedNodes.length > 0 && (
            <>
              <Separator className="my-8" />
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-foreground font-serif">Shared with you</h3>
                  <Badge variant="outline">
                    {sharedNodes.reduce((total, group) => total + group.nodes.length, 0)} shared nodes
                  </Badge>
                </div>

                <div className="space-y-8">
                  {sharedNodes.map((group) => (
                    <div key={group.owner_id} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h4 className="text-lg font-medium text-foreground">
                          {group.owner_name}'s nodes
                        </h4>
                        <Badge variant="secondary">{group.nodes.length} nodes</Badge>
                      </div>
                      
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {group.nodes.map((node) => (
                          <Card key={node.id} className="card-hover-lift border-cottage-warm">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{node.display_name}</CardTitle>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewNode(node.id)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                              <CardDescription>
                                {config.getBaseUrl()}/{node.subdomain_name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Owner:</span>
                                  <span className="font-medium">{group.owner_name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Created:</span>
                                  <span>{new Date(node.created_at * 1000).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="mt-4 flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(`${config.getBaseUrl()}/${node.subdomain_name}`, '_blank')}
                                >
                                  <Link className="h-4 w-4 mr-2" />
                                  View Node
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewNode(node.id)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 