'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Share2, Copy } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Node, Link as LinkType } from '@/types';
import { getIcon } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import ThemeRenderer from '@/components/themes/ThemeRegistry';

// Helper function to generate gradient style
const getGradientStyle = (link: LinkType): React.CSSProperties => {
  if (!link.gradient_type || !link.color_stops || link.color_stops.length === 0) {
    return {};
  }

  const stops = link.color_stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ');

  if (link.gradient_type === 'solid') {
    return {
      backgroundColor: link.color_stops[0].color
    };
  } else if (link.gradient_type === 'linear') {
    return {
      background: `linear-gradient(${link.gradient_angle || 0}deg, ${stops})`
    };
  } else if (link.gradient_type === 'radial') {
    return {
      background: `radial-gradient(circle, ${stops})`
    };
  }

  return {};
};

export default function PublicNode() {
  const params = useParams();
  const { toast } = useToast();
  const [node, setNode] = useState<Node | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublicNode = useCallback(async () => {
    if (!params.name) {
      setError('Node not found');
      setLoading(false);
      return;
    }

    try {
      const [nodeResponse, linksResponse] = await Promise.all([
        apiClient.getNodeByName(params.name as string),
        apiClient.getPublicLinksByName(params.name as string)
      ]);

      if (nodeResponse.data) {
        setNode(nodeResponse.data as Node);
      } else {
        setError('Node not found');
      }

      if (linksResponse.data) {
        setLinks(linksResponse.data as LinkType[]);
      }
    } catch (error) {
      console.error('Error loading public node:', error);
      setError('Failed to load node');
    } finally {
      setLoading(false);
    }
  }, [params.name]);

  useEffect(() => {
    loadPublicNode();
  }, [params.name, loadPublicNode]);

  const handleLinkClick = (link: LinkType) => {
    if (link.link && link.link.trim() !== '') {
      window.open(link.link, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: node?.page_title || 'Link Page',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCopyRedirect = (link: LinkType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (link.name) {
      const redirectUrl = `${window.location.origin}/${params.name}/${link.name}`;
      navigator.clipboard.writeText(redirectUrl);
      toast({
        title: "Redirect URL copied!",
        description: `Copied ${redirectUrl} to clipboard`,
      });
    }
  };

  useEffect(() => {
    if (node) {
      document.title = node.page_title || 'Link Page';
      document.querySelector('meta[name="description"]')?.setAttribute('content', node.description || 'A collection of links');
    }
  }, [node]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !node) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Node Not Found</h1>
          <p className="text-muted-foreground">
            The node you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: node.background_color }}
    >
      {/* Theme Background */}
      {node.theme && node.theme !== 'default' && (
        <ThemeRenderer
          themeName={node.theme}
          themeColor={node.theme_color}
          accentColor={node.accent_color}
          titleFontColor={node.title_font_color}
          captionFontColor={node.caption_font_color}
          backgroundColor={node.background_color}
          mouseEffectsEnabled={node.mouse_effects_enabled}
          textShadowsEnabled={node.text_shadows_enabled}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 relative" style={{ zIndex: node.theme !== 'default' ? 50 : 'auto' }}>
            <h1 
              className={`text-4xl font-bold mb-4 ${node.text_shadows_enabled ? 'drop-shadow-lg' : ''}`}
              style={{ 
                color: node.title_font_color || '#8B7355',
                textShadow: node.text_shadows_enabled ? '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {node.display_name}
            </h1>
            {node.description && (
              <p 
                className={`text-xl mb-6 max-w-lg mx-auto ${node.text_shadows_enabled ? 'drop-shadow-lg' : ''}`}
                style={{ 
                  color: node.caption_font_color || '#666666',
                  textShadow: node.text_shadows_enabled ? '0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                {node.description}
              </p>
            )}

            {/* Mini Links - Right below description */}
            {links.filter(link => link.mini).length > 0 && (
              <div className={`flex items-center justify-center space-x-4 mb-8 ${node.text_shadows_enabled ? 'drop-shadow-lg' : ''}`} style={{ zIndex: node.theme !== 'default' ? 50 : 'auto' }}>
                {links.filter(link => link.mini).map((link) => {
                  return (
                    <div
                      key={link.id}
                      className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center backdrop-blur-sm ${
                        link.mini_background_enabled ? '' : 'bg-white/10'
                      }`}
                      style={{
                        boxShadow: node.text_shadows_enabled ? '0 4px 8px rgba(0,0,0,0.3)' : 'none',
                        ...(link.mini_background_enabled && {
                          background: getGradientStyle(link).background || 'transparent'
                        })
                      }}
                      onClick={() => handleLinkClick(link)}
                      title={link.display_name}
                    >
                      <div
                        style={{
                          color: link.custom_accent_color_enabled && link.custom_accent_color 
                            ? link.custom_accent_color 
                            : node.accent_color || '#8B9A47'
                        }}
                      >
                        {React.createElement(getIcon(link.icon), { 
                          className: "h-6 w-6"
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {node.show_share_button && (
              <div className={`flex items-center justify-center space-x-4 ${node.text_shadows_enabled ? 'drop-shadow-lg' : ''}`} style={{ zIndex: node.theme !== 'default' ? 50 : 'auto' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  style={{ 
                    borderColor: node.accent_color || '#8B9A47',
                    color: node.accent_color || '#8B9A47',
                    textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    boxShadow: node.text_shadows_enabled ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: node.accent_color || '#8B9A47',
                    color: '#F5F1E8',
                    textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    boxShadow: node.text_shadows_enabled ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {links.length} links
                </Badge>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Regular Links */}
          <div className="space-y-4" style={{ zIndex: node.theme !== 'default' ? 50 : 'auto' }}>
            {links.filter(link => !link.mini).map((link) => {
              const gradientStyle = getGradientStyle(link);
              return (
                <Card 
                  key={link.id} 
                  className={`card-hover-lift cursor-pointer transition-all duration-200 hover:scale-[1.02] bg-transparent ${node.theme !== 'default' ? 'drop-shadow-lg' : ''}`}
                  style={{
                    ...gradientStyle,
                                          borderColor: link.custom_accent_color_enabled && link.custom_accent_color 
                        ? link.custom_accent_color 
                        : node.accent_color || '#8B9A47',
                    boxShadow: node.text_shadows_enabled ? '0 8px 16px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' : 'none'
                  }}
                  onClick={() => handleLinkClick(link)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="text-2xl"
                          style={{ 
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                            color: link.custom_accent_color_enabled && link.custom_accent_color 
                              ? link.custom_accent_color 
                              : node.accent_color || '#8B9A47'
                          }}
                        >
                          {React.createElement(getIcon(link.icon), { className: "h-6 w-6" })}
                        </div>
                        <div>
                          <h3 
                            className={`text-lg font-semibold ${node.text_shadows_enabled ? 'drop-shadow-sm' : ''}`}
                            style={{ 
                              color: link.custom_title_color_enabled && link.custom_title_color 
                                ? link.custom_title_color 
                                : node.title_font_color || '#8B7355',
                              textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}
                          >
                            {link.display_name}
                          </h3>
                          {link.description && (
                            <p 
                              className={`text-sm ${node.text_shadows_enabled ? 'drop-shadow-sm' : ''}`}
                              style={{ 
                                color: link.custom_description_color_enabled && link.custom_description_color 
                                  ? link.custom_description_color 
                                  : node.caption_font_color || '#666666',
                                textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                              }}
                            >
                              {link.description}
                            </p>
                          )}
                          {!link.description && link.link && (
                            <p 
                              className={`text-sm ${node.text_shadows_enabled ? 'drop-shadow-sm' : ''}`}
                              style={{ 
                                color: link.custom_description_color_enabled && link.custom_description_color 
                                  ? link.custom_description_color 
                                  : node.caption_font_color || '#666666',
                                textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                              }}
                            >
                              {link.link}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {link.name && (
                          <button
                            onClick={(e) => handleCopyRedirect(link, e)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Copy redirect URL"
                          >
                            <Copy 
                              className="h-4 w-4" 
                              style={{ 
                                color: link.custom_accent_color_enabled && link.custom_accent_color 
                                  ? link.custom_accent_color 
                                  : node.accent_color || '#8B9A47'
                              }}
                            />
                          </button>
                        )}
                        <ExternalLink 
                          className="h-5 w-5" 
                          style={{ 
                            color: link.custom_accent_color_enabled && link.custom_accent_color 
                              ? link.custom_accent_color 
                              : node.accent_color || '#8B9A47'
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          {!node.hide_powered_by && (
            <div className="text-center mt-12" style={{ zIndex: node.theme !== 'default' ? 50 : 'auto' }}>
              <p 
                className={`text-sm ${node.text_shadows_enabled ? 'drop-shadow-sm' : ''}`}
                style={{ 
                  color: node.caption_font_color || '#666666',
                  textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                Powered by{' '}
                <span 
                  className={`font-semibold ${node.text_shadows_enabled ? 'drop-shadow-sm' : ''}`}
                  style={{ 
                    color: node.accent_color || '#8B9A47',
                    textShadow: node.text_shadows_enabled ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  Treenode
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}