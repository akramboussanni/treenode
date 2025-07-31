'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Node, Link as LinkType } from '@/types';
import TreenodeRenderer from '@/components/TreenodeRenderer';

export default function PublicNode() {
  const params = useParams();
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
    <TreenodeRenderer
      node={node}
      links={links}
    />
  );
}