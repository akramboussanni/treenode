'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Globe, 
  ExternalLink, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Palette,
  Search,
  Users,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { Node, Link as LinkType } from '@/types';
import { getIcon, getIconList } from '@/lib/icons';
import { config } from '@/config';
import LinkEditor from '@/components/LinkEditor';

const updateNodeSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  title_font_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  caption_font_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  theme_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  show_share_button: z.boolean(),
  theme: z.string(),
  mouse_effects_enabled: z.boolean().optional(),
  text_shadows_enabled: z.boolean().optional(),
  hide_powered_by: z.boolean().optional(),
  page_title: z.string().min(1, 'Node title is required'),
});

const createLinkSchema = z.object({
  name: z.string().min(1, 'Link name is required').regex(/^[a-z0-9-]+$/, 'Link name can only contain lowercase letters, numbers, and hyphens'),
  display_name: z.string().min(1, 'Display name is required'),
  link: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  visible: z.boolean(),
  enabled: z.boolean(),
  mini: z.boolean(),
  gradient_type: z.string().min(1, 'Gradient type is required'),
  gradient_angle: z.number().optional(),
});

type UpdateNodeFormData = z.infer<typeof updateNodeSchema>;
type CreateLinkFormData = z.infer<typeof createLinkSchema>;

export default function NodeManagementPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const nodeId = params.id as string;
  
  const [node, setNode] = useState<Node | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loadingNode, setLoadingNode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [deletingLink, setDeletingLink] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false);
  const [updatingLink, setUpdatingLink] = useState<string | null>(null);
  const [reorderingLink, setReorderingLink] = useState<string | null>(null);
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);

  const {
    register: registerNode,
    handleSubmit: handleSubmitNode,
    formState: { errors: nodeErrors },
    reset: resetNode,
    setValue: setNodeValue,
    watch: watchNode,
  } = useForm<UpdateNodeFormData>({
    resolver: zodResolver(updateNodeSchema),
  });

  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email('Must be a valid email'),
    })),
  });

  // Color picker handlers
  const handleColorChange = (field: keyof UpdateNodeFormData, value: string) => {
    setNodeValue(field, value);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user && nodeId) {
      loadNode();
    }
  }, [user, nodeId]);

  useEffect(() => {
    if (node && !isEditing) {
      resetNode({
        display_name: node.display_name,
        description: node.description,
        background_color: node.background_color,
        title_font_color: node.title_font_color || '#8B7355',
        caption_font_color: node.caption_font_color || '#666666',
        accent_color: node.accent_color || '#66CC66',
        theme_color: node.theme_color || '#ffffff',
        show_share_button: node.show_share_button ?? true,
        theme: node.theme || 'default',
        page_title: node.page_title,
        mouse_effects_enabled: node.mouse_effects_enabled ?? true,
        text_shadows_enabled: node.text_shadows_enabled ?? false,
        hide_powered_by: node.hide_powered_by ?? false,
      });
    }
  }, [node, isEditing, resetNode]);

  const loadNode = async () => {
    try {
      setLoadingNode(true);
      const [nodeResponse, linksResponse] = await Promise.all([
        apiClient.getNode(nodeId),
        apiClient.getLinks(nodeId),
      ]);

      if (nodeResponse.error === 'Unauthorized') {
        // Handle authentication error
        router.push('/login');
        return;
      }

      if (nodeResponse.data) {
        const nodeData = nodeResponse.data as Node;
        setNode(nodeData);
        resetNode({
          display_name: nodeData.display_name,
          description: nodeData.description,
          background_color: nodeData.background_color,
          title_font_color: nodeData.title_font_color || '#8B7355',
          caption_font_color: nodeData.caption_font_color || '#666666',
          accent_color: nodeData.accent_color || '#66CC66',
          theme_color: nodeData.theme_color || '#ffffff',
          show_share_button: nodeData.show_share_button ?? true,
          theme: nodeData.theme || 'default',
          page_title: nodeData.page_title,
          mouse_effects_enabled: nodeData.mouse_effects_enabled ?? true,
          text_shadows_enabled: nodeData.text_shadows_enabled ?? false,
          hide_powered_by: nodeData.hide_powered_by ?? false,
        });
      }

      if (linksResponse.data) {
        setLinks(linksResponse.data as LinkType[]);
      }
    } catch (error) {
      console.error('Error loading node:', error);
      toast({
        title: "Error",
        description: "Failed to load node",
        variant: "destructive",
      });
    } finally {
      setLoadingNode(false);
    }
  };

  const loadCollaborators = async () => {
    try {
      setLoadingCollaborators(true);
      const [collaboratorsResponse, invitationsResponse] = await Promise.all([
        apiClient.getCollaborators(nodeId),
        apiClient.getInvitations(nodeId),
      ]);

      if (collaboratorsResponse.error === 'Unauthorized') {
        // Handle authentication error
        router.push('/login');
        return;
      }

      if (collaboratorsResponse.data) {
        setCollaborators(collaboratorsResponse.data as any[]);
      }

      if (invitationsResponse.data) {
        setInvitations(invitationsResponse.data as any[]);
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast({
        title: "Error",
        description: "Failed to load collaborators",
        variant: "destructive",
      });
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleUpdateNode = async (data: UpdateNodeFormData) => {
    try {
      const response = await apiClient.updateNode(nodeId, data);
      if (response.error === 'Unauthorized') {
        // Handle authentication error
        router.push('/login');
        return;
      }
      
      if (response.data) {
        setNode(response.data as Node);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Node updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update node",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the node",
        variant: "destructive",
      });
    }
  };

  const handleInviteCollaborator = async (data: { email: string }) => {
    if (!node) return;
    
    setIsInviting(true);
    try {
      const response = await apiClient.inviteCollaborator(nodeId, data.email, config.getBaseUrl());
      
      if (response.data) {
        // Check if it's a resend or new invitation based on the message
        const responseData = response.data as { message?: string };
        const isResend = responseData.message && responseData.message.includes("resent");
        toast({
          title: "Success",
          description: isResend ? "Invitation resent successfully!" : "Invitation sent successfully!",
        });
        setShowInviteDialog(false);
        resetInvite();
        // Refresh collaborators list
        loadCollaborators();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const response = await apiClient.removeCollaborator(nodeId, userId);
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Collaborator removed successfully",
        });
        // Refresh collaborators list
        loadCollaborators();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to remove collaborator",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while removing the collaborator",
        variant: "destructive",
      });
    }
  };

  const handleViewPage = () => {
    if (node) {
      const baseUrl = config.getBaseUrl();
      window.open(`${baseUrl}/${node.subdomain_name}`, '_blank');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetNode();
  };

  const handleCreateLink = async (data: CreateLinkFormData) => {
    try {
      const response = await apiClient.createLink(nodeId, data);
      if (response.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      
      if (response.data) {
        setLinks([...links, response.data as LinkType]);
        setShowLinkEditor(false);
        toast({
          title: "Success",
          description: "Link created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the link",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLink = async (data: any) => {
    if (!editingLink) return;
    
    try {
      setUpdatingLink(editingLink.id);
      const response = await apiClient.updateLink(nodeId, editingLink.id, data);
      
      if (response.data) {
        setLinks(links.map(link => 
          link.id === editingLink.id ? { ...link, ...data } : link
        ));
        setEditingLink(null);
        toast({
          title: "Success",
          description: "Link updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update link",
          variant: "destructive",
        });
        throw new Error(response.error || "Failed to update link");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the link",
        variant: "destructive",
      });
      throw error; // Re-throw to let LinkEditor know the submission failed
    } finally {
      setUpdatingLink(null);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setDeletingLink(linkId);
      const response = await apiClient.deleteLink(nodeId, linkId);
      if (response.error === 'Unauthorized') {
        router.push('/login');
        return;
      }
      
      if (response.data) {
        setLinks(links.filter(link => link.id !== linkId));
        toast({
          title: "Success",
          description: "Link deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the link",
        variant: "destructive",
      });
    } finally {
      setDeletingLink(null);
    }
  };

  const moveLinkUp = async (linkId: string) => {
    if (reorderingLink) return;
    setReorderingLink(linkId);
    try {
      const currentIndex = links.findIndex(link => link.id === linkId);
      if (currentIndex > 0) {
        const newPosition = currentIndex - 1;
        await apiClient.reorderLink(nodeId, linkId, newPosition);
        // Update local state
        const newLinks = [...links];
        const temp = newLinks[currentIndex];
        newLinks[currentIndex] = newLinks[currentIndex - 1];
        newLinks[currentIndex - 1] = temp;
        setLinks(newLinks);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder link",
        variant: "destructive",
      });
    } finally {
      setReorderingLink(null);
    }
  };

  const moveLinkDown = async (linkId: string) => {
    if (reorderingLink) return;
    setReorderingLink(linkId);
    try {
      const currentIndex = links.findIndex(link => link.id === linkId);
      if (currentIndex < links.length - 1) {
        const newPosition = currentIndex + 1;
        await apiClient.reorderLink(nodeId, linkId, newPosition);
        // Update local state
        const newLinks = [...links];
        const temp = newLinks[currentIndex];
        newLinks[currentIndex] = newLinks[currentIndex + 1];
        newLinks[currentIndex + 1] = temp;
        setLinks(newLinks);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder link",
        variant: "destructive",
      });
    } finally {
      setReorderingLink(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, linkId: string) => {
    setDraggedLinkId(linkId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', linkId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetLinkId: string) => {
    e.preventDefault();
    if (!draggedLinkId || draggedLinkId === targetLinkId) {
      setDraggedLinkId(null);
      return;
    }

    const draggedIndex = links.findIndex(link => link.id === draggedLinkId);
    const targetIndex = links.findIndex(link => link.id === targetLinkId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLinkId(null);
      return;
    }

    setReorderingLink(draggedLinkId);
    try {
      await apiClient.reorderLink(nodeId, draggedLinkId, targetIndex);
      
      // Update local state instead of reloading
      const newLinks = [...links];
      const draggedLink = newLinks[draggedIndex];
      newLinks.splice(draggedIndex, 1);
      newLinks.splice(targetIndex, 0, draggedLink);
      setLinks(newLinks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder link",
        variant: "destructive",
      });
    } finally {
      setReorderingLink(null);
      setDraggedLinkId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedLinkId(null);
  };

  if (loading || loadingNode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !node) {
    return null;
  }

  return (
    <div className="min-h-screen">
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
              <h1 className="text-2xl font-bold text-foreground">Manage Node</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPage}
              >
                <Globe className="h-4 w-4 mr-2" />
                View Node
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Node Settings */}
          <Card className="mb-8 border-cottage-brown/20 bg-cottage-cream">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-cottage-brown font-serif">Node Settings</CardTitle>
                  <CardDescription>
                    Configure your link page appearance and information
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCollaboratorsDialog(true);
                      loadCollaborators();
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Collaborators
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInviteDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Collaborator
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                  >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNode(handleUpdateNode)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-cottage-brown">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Configure the basic details of your node</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        {...registerNode('display_name')}
                        disabled={!isEditing}
                      />
                      {nodeErrors.display_name && (
                        <p className="text-sm text-destructive">{nodeErrors.display_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="page_title">Node Title</Label>
                      <Input
                        id="page_title"
                        {...registerNode('page_title')}
                        disabled={!isEditing}
                      />
                      {nodeErrors.page_title && (
                        <p className="text-sm text-destructive">{nodeErrors.page_title.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      {...registerNode('description')}
                      disabled={!isEditing}
                    />
                    {nodeErrors.description && (
                      <p className="text-sm text-destructive">{nodeErrors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Color Scheme Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-cottage-brown">Color Scheme</h3>
                    <p className="text-sm text-muted-foreground">Customize the colors of your public page</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={watchNode('background_color') || '#ffffff'}
                        onChange={(e) => handleColorChange('background_color', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <Input
                        {...registerNode('background_color')}
                        disabled={!isEditing}
                        placeholder="#ffffff"
                      />
                    </div>
                    {nodeErrors.background_color && (
                      <p className="text-sm text-destructive">{nodeErrors.background_color.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_font_color">Title Font Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="title_font_color"
                        type="color"
                        value={watchNode('title_font_color') || '#8B7355'}
                        onChange={(e) => handleColorChange('title_font_color', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <Input
                        {...registerNode('title_font_color')}
                        disabled={!isEditing}
                        placeholder="#8B7355"
                      />
                    </div>
                    {nodeErrors.title_font_color && (
                      <p className="text-sm text-destructive">{nodeErrors.title_font_color.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption_font_color">Caption Font Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="caption_font_color"
                        type="color"
                        value={watchNode('caption_font_color') || '#666666'}
                        onChange={(e) => handleColorChange('caption_font_color', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <Input
                        {...registerNode('caption_font_color')}
                        disabled={!isEditing}
                        placeholder="#666666"
                      />
                    </div>
                    {nodeErrors.caption_font_color && (
                      <p className="text-sm text-destructive">{nodeErrors.caption_font_color.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={watchNode('accent_color') || '#66CC66'}
                        onChange={(e) => handleColorChange('accent_color', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <Input
                        {...registerNode('accent_color')}
                        disabled={!isEditing}
                        placeholder="#66CC66"
                      />
                    </div>
                    {nodeErrors.accent_color && (
                      <p className="text-sm text-destructive">{nodeErrors.accent_color.message}</p>
                    )}
                  </div>
                </div>

                {/* Theme & Effects Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-cottage-brown">Theme & Effects</h3>
                    <p className="text-sm text-muted-foreground">Configure the visual theme and interactive effects</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      {...registerNode('theme')}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="default">Default</option>
                      <option value="love">Love Theme</option>
                      <option value="retro-terminal">Retro Terminal</option>
                      <option value="neon-cyber">Neon Cyber</option>
                      <option value="nature-forest">Nature Forest</option>
                      <option value="liquid-chrome">Liquid Chrome</option>
                      <option value="galaxy">Galaxy</option>
                      <option value="ballpit">Ballpit</option>
                      <option value="iridescence">Iridescence</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Choose a theme to change the background of your public page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme_color">Theme Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="theme_color"
                        type="color"
                        value={watchNode('theme_color') || '#ffffff'}
                        onChange={(e) => handleColorChange('theme_color', e.target.value)}
                        disabled={!isEditing}
                        className="w-20 h-10"
                      />
                      <Input
                        {...registerNode('theme_color')}
                        disabled={!isEditing}
                        placeholder="#ffffff"
                      />
                    </div>
                    {nodeErrors.theme_color && (
                      <p className="text-sm text-destructive">{nodeErrors.theme_color.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This color is used by themes for their accent colors and mini icons.
                    </p>
                  </div>

                  {watchNode('theme') && watchNode('theme') !== 'default' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="mouse_effects_enabled">Enable Mouse Effects</Label>
                          <Switch
                            id="mouse_effects_enabled"
                            checked={watchNode('mouse_effects_enabled') ?? true}
                            onCheckedChange={(checked) => setNodeValue('mouse_effects_enabled', checked)}
                            disabled={!isEditing}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          When enabled, the theme background will respond to mouse movements.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="text_shadows_enabled">Enable Text Shadows</Label>
                      <Switch
                        id="text_shadows_enabled"
                        checked={watchNode('text_shadows_enabled') ?? false}
                        onCheckedChange={(checked) => setNodeValue('text_shadows_enabled', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, text will have shadow effects for better readability.
                    </p>
                  </div>
                </div>

                {/* Display Options Section */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold text-cottage-brown">Display Options</h3>
                    <p className="text-sm text-muted-foreground">Configure what visitors see on your public page</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_share_button">Show Share Button & Links Counter</Label>
                      <Switch
                        id="show_share_button"
                        checked={watchNode('show_share_button')}
                        onCheckedChange={(checked) => setNodeValue('show_share_button', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, visitors can see the share button and links counter on your public page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hide_powered_by">Hide "Powered by Treenode"</Label>
                      <Switch
                        id="hide_powered_by"
                        checked={watchNode('hide_powered_by') ?? false}
                        onCheckedChange={(checked) => setNodeValue('hide_powered_by', checked)}
                        disabled={!isEditing}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When enabled, the "Powered by Treenode" footer will be hidden on your public page.
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <Button type="submit" className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream">
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Links Management */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Links</h2>
              <Button
                onClick={() => setShowLinkEditor(true)}
                className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>

            {showLinkEditor && (
              <LinkEditor
                isOpen={showLinkEditor}
                onClose={() => {
                  setShowLinkEditor(false);
                  setEditingLink(null);
                }}
                onSubmit={editingLink ? handleUpdateLink : handleCreateLink}
                initialData={editingLink || undefined}
                isEditing={!!editingLink}
                isSubmitting={updatingLink !== null}
              />
            )}

            <div className="space-y-4">
              {links.map((link, index) => (
                <Card
                  key={link.id}
                  className={`mb-4 transition-all duration-200 ${
                    draggedLinkId === link.id ? 'opacity-50 scale-95' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, link.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, link.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {React.createElement(getIcon(link.icon), { className: "h-6 w-6" })}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {link.display_name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {link.link}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(link.link, '_blank')}
                              className="h-6 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              URL: {config.getBaseUrl()}/{node?.subdomain_name}/{link.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {link.visible ? (
                              <Badge variant="default" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Visible
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                            {link.enabled ? (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Enabled
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Reorder buttons */}
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLinkUp(link.id)}
                            disabled={index === 0 || reorderingLink === link.id}
                            className="h-6 px-1"
                          >
                            {reorderingLink === link.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <ChevronUp className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveLinkDown(link.id)}
                            disabled={index === links.length - 1 || reorderingLink === link.id}
                            className="h-6 px-1"
                          >
                            {reorderingLink === link.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        </div>

                        {/* Drag handle */}
                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLink(link);
                            setShowLinkEditor(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                          disabled={deletingLink === link.id}
                        >
                          {deletingLink === link.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {links.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">No links yet</p>
                    <Button
                      onClick={() => setShowLinkEditor(true)}
                      className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Link
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Invite Collaborator Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Send an email invitation to collaborate on this node
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitInvite(handleInviteCollaborator)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="Enter collaborator's email"
                {...registerInvite('email')}
              />
              {inviteErrors.email && (
                <p className="text-sm text-destructive">{inviteErrors.email.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  resetInvite();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
              >
                {isInviting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collaborators Dialog */}
      <Dialog open={showCollaboratorsDialog} onOpenChange={setShowCollaboratorsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Collaborators</DialogTitle>
            <DialogDescription>
              Invite people to collaborate on this node. They will be able to edit links and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter email address"
                value={invitingEmail}
                onChange={(e) => setInvitingEmail(e.target.value)}
              />
              <Button
                onClick={() => handleInviteCollaborator({ email: invitingEmail })}
                disabled={isInviting || !invitingEmail}
                className="bg-cottage-green hover:bg-cottage-green/90 text-cottage-cream"
              >
                {isInviting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Current Collaborators</h4>
                {collaborators.length > 0 ? (
                <div className="space-y-2">
                  {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{collaborator.email}</span>
                      </div>
                        <Badge variant="secondary">Collaborator</Badge>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No collaborators yet</p>
              )}
            </div>

            <div>
                <h4 className="font-medium mb-2">Pending Invitations</h4>
                {invitations.length > 0 ? (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invitation.email}</span>
                      </div>
                        <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending invitations</p>
              )}
            </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 