'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Github,
  Code,
  User,
  Plus,
  Link,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';
import { getAvailableThemes } from '@/components/themes/ThemeRegistry';
import TreenodeRenderer from '@/components/TreenodeRenderer';
import { Node, Link as LinkType } from '@/types';
import Head from 'next/head';

// Sample data for the "Your Links" section
const sampleNodes: { node: Node; links: LinkType[] }[] = [
  {
    node: {
      id: "2",
      owner_id: "2",
      display_name: "Marcus Rodriguez",
      subdomain_name: "marcus",
      description: "Freelance Designer & Developer",
      background_color: "#0a0a0a",
      title_font_color: "#00ffff",
      caption_font_color: "#cccccc",
      accent_color: "#00ffff",
      theme_color: "#00ffff",
      show_share_button: true,
      theme: "neon-cyber",
      mouse_effects_enabled: true,
      text_shadows_enabled: true,
      hide_powered_by: false,
      page_title: "Marcus Rodriguez's Portfolio",
      domain: "",
      domain_verified: false,
      created_at: 0,
      updated_at: 0,
      collaborators: []
    },
    links: [
      // Mini links
      {
        id: "6",
        node_id: "2",
        name: "behance",
        display_name: "Behance",
        link: "https://behance.net/marcusrodriguez",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "behance",
        position: 1,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      {
        id: "7",
        node_id: "2",
        name: "dribbble",
        display_name: "Dribbble",
        link: "https://dribbble.com/marcusrodriguez",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "dribbble",
        position: 2,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      // Theme-matching links
      {
        id: "8",
        node_id: "2",
        name: "portfolio",
        display_name: "Portfolio",
        link: "https://marcusrodriguez.dev",
        description: "View my latest work",
        visible: true,
        enabled: true,
        mini: false,
        icon: "briefcase",
        position: 3,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "5", link_id: "8", color: "#000000", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      {
        id: "9",
        node_id: "2",
        name: "dribbble",
        display_name: "Dribbble",
        link: "https://dribbble.com/marcusrodriguez",
        description: "Design inspiration",
        visible: true,
        enabled: true,
        mini: false,
        icon: "behance",
        position: 4,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "6", link_id: "9", color: "#000000", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      // Gradient link with different accent
      {
        id: "10",
        node_id: "2",
        name: "linkedin",
        display_name: "LinkedIn",
        link: "https://linkedin.com/in/marcusrodriguez",
        description: "Professional network",
        visible: true,
        enabled: true,
        mini: false,
        icon: "linkedin",
        position: 5,
        created_at: 0,
        updated_at: 0,
        gradient_type: "linear",
        gradient_angle: 135,
        color_stops: [
          { id: "3", link_id: "10", color: "#0077B5", position: 0, created_at: 0 },
          { id: "4", link_id: "10", color: "#005885", position: 100, created_at: 0 }
        ],
        custom_accent_color_enabled: true,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: true,
        custom_title_color: "#ffffff",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      }
    ]
  },
  {
    node: {
      id: "3",
      owner_id: "3",
      display_name: "Marame Thompson",
      subdomain_name: "emma",
      description: "Content Creator & Influencer",
      background_color: "#2d5016",
      title_font_color: "#ffffff",
      caption_font_color: "#e0e0e0",
      accent_color: "#4ade80",
      theme_color: "#4ade80",
      show_share_button: true,
      theme: "nature-forest",
      mouse_effects_enabled: true,
      text_shadows_enabled: true,
      hide_powered_by: false,
      page_title: "Marame Thompson's Links",
      domain: "",
      domain_verified: false,
      created_at: 0,
      updated_at: 0,
      collaborators: []
    },
    links: [
      // Mini links
      {
        id: "11",
        node_id: "3",
        name: "snapchat",
        display_name: "Snapchat",
        link: "https://snapchat.com/add/emmathompson",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "camera",
        position: 1,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      {
        id: "12",
        node_id: "3",
        name: "discord",
        display_name: "Discord",
        link: "https://discord.gg/emmathompson",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "globe",
        position: 2,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      // Theme-matching links
      {
        id: "13",
        node_id: "3",
        name: "tiktok",
        display_name: "TikTok",
        link: "https://tiktok.com/@emmathompson",
        description: "Short-form content",
        visible: true,
        enabled: true,
        mini: false,
        icon: "tiktok",
        position: 3,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "7", link_id: "13", color: "#1a3d1a", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      {
        id: "14",
        node_id: "3",
        name: "instagram",
        display_name: "Instagram",
        link: "https://instagram.com/emmathompson",
        description: "Lifestyle and fashion",
        visible: true,
        enabled: true,
        mini: false,
        icon: "instagram",
        position: 4,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "8", link_id: "14", color: "#1a3d1a", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      // Gradient link with different accent
      {
        id: "15",
        node_id: "3",
        name: "pinterest",
        display_name: "Pinterest",
        link: "https://pinterest.com/emmathompson",
        description: "Inspiration boards",
        visible: true,
        enabled: true,
        mini: false,
        icon: "pinterest",
        position: 5,
        created_at: 0,
        updated_at: 0,
        gradient_type: "radial",
        gradient_angle: 0,
        color_stops: [
          { id: "9", link_id: "15", color: "#E60023", position: 0, created_at: 0 },
          { id: "10", link_id: "15", color: "#BD001C", position: 100, created_at: 0 }
        ],
        custom_accent_color_enabled: true,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      }
    ]
  },
  {
    node: {
      id: "1",
      owner_id: "1",
      display_name: "Sarah Chen",
      subdomain_name: "sarah",
      description: "Digital Creator & Tech Enthusiast",
      background_color: "#F5F1E8",
      title_font_color: "#8B7355",
      caption_font_color: "#666666",
      accent_color: "#8B9A47",
      theme_color: "#ff6b9d",
      show_share_button: true,
      theme: "love",
      mouse_effects_enabled: true,
      text_shadows_enabled: false,
      hide_powered_by: false,
      page_title: "Sarah Chen's Links",
      domain: "",
      domain_verified: false,
      created_at: 0,
      updated_at: 0,
      collaborators: []
    },
    links: [
      // Mini links
      {
        id: "1",
        node_id: "1",
        name: "twitter",
        display_name: "Twitter",
        link: "https://twitter.com/sarahchen",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "twitter",
        position: 1,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      {
        id: "2",
        node_id: "1",
        name: "github",
        display_name: "GitHub",
        link: "https://github.com/sarahchen",
        description: "",
        visible: true,
        enabled: true,
        mini: true,
        icon: "github",
        position: 2,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: true
      },
      // Theme-matching links
      {
        id: "3",
        node_id: "1",
        name: "instagram",
        display_name: "Instagram",
        link: "https://instagram.com/sarahchen",
        description: "Follow my daily adventures",
        visible: true,
        enabled: true,
        mini: false,
        icon: "instagram",
        position: 3,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "1", link_id: "3", color: "#F5F1E8", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      {
        id: "4",
        node_id: "1",
        name: "youtube",
        display_name: "YouTube",
        link: "https://youtube.com/@sarahchen",
        description: "Tech tutorials and reviews",
        visible: true,
        enabled: true,
        mini: false,
        icon: "youtube",
        position: 4,
        created_at: 0,
        updated_at: 0,
        gradient_type: "solid",
        gradient_angle: 0,
        color_stops: [
          { id: "2", link_id: "4", color: "#F5F1E8", position: 0, created_at: 0 }
        ],
        custom_accent_color_enabled: false,
        custom_accent_color: "",
        custom_title_color_enabled: false,
        custom_title_color: "",
        custom_description_color_enabled: false,
        custom_description_color: "",
        mini_background_enabled: false
      },
      // Gradient link with different accent
      {
        id: "5",
        node_id: "1",
        name: "blog",
        display_name: "Blog",
        link: "https://sarahchen.dev",
        description: "Tech articles and thoughts",
        visible: true,
        enabled: true,
        mini: false,
        icon: "globe",
        position: 5,
        created_at: 0,
        updated_at: 0,
        gradient_type: "linear",
        gradient_angle: 45,
        color_stops: [
          { id: "5", link_id: "5", color: "#E4405F", position: 0, created_at: 0 },
          { id: "6", link_id: "5", color: "#C13584", position: 100, created_at: 0 }
        ],
        custom_accent_color_enabled: true,
        custom_accent_color: "#ffffff",
        custom_title_color_enabled: true,
        custom_title_color: "#ffffff",
        custom_description_color_enabled: true,
        custom_description_color: "#f0f0f0",
        mini_background_enabled: false
      }
    ]
  },
];

export default function LandingPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const availableThemes = getAvailableThemes();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // Handle logout error if needed
    }
  };

  const handleDashboardClick = async () => {
    try {
      await refreshUser();
      router.push('/dashboard');
    } catch {
      // If refresh fails, user is not authenticated, redirect to login
      router.push('/login');
    }
  };

  const nextTheme = useCallback(() => {
    setCurrentThemeIndex((prev) => (prev + 1) % availableThemes.length);
  }, [availableThemes.length]);

  const prevTheme = useCallback(() => {
    setCurrentThemeIndex((prev) => (prev - 1 + availableThemes.length) % availableThemes.length);
  }, [availableThemes.length]);

  const nextPerson = useCallback(() => {
    setCurrentPersonIndex((prev) => (prev + 1) % sampleNodes.length);
  }, []);

  const prevPerson = useCallback(() => {
    setCurrentPersonIndex((prev) => (prev - 1 + sampleNodes.length) % sampleNodes.length);
  }, []);

  // Create a modified node with the current theme
  const getCurrentPreviewNode = () => {
    const baseNode = sampleNodes[currentPersonIndex].node;
    return {
      ...baseNode,
      theme: availableThemes[currentThemeIndex],
      mouse_effects_enabled: true
    };
  };

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

  return (
    <div className="min-h-screen">
      <Head>
        <title>Treenode - Your Links, Your Node</title>
        <meta name="description" content="Create stunning, customizable link nodes that showcase your online presence" />
      </Head>

      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
              >
                <h1 className="text-2xl font-bold text-foreground">Treenode</h1>
              </button>
              {user && <Badge variant="secondary">Home</Badge>}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDashboardClick}>
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => router.push('/register')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl font-bold text-foreground mb-4">
            Treenode
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 font-light">
            Your Links – Your Node
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Create a beautiful, customizable page that showcases all your important links in one place. 
            Perfect for social media bios, business cards, or anywhere you want to share multiple links with a single URL.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-5 w-5" />
              Start Creating
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open('https://github.com/akramboussanni/treenode', '_blank')}
            >
              <Github className="mr-2 h-5 w-5" />
              View Source
            </Button>
          </div>
        </div>
      </section>

      {/* Combined Theme & Treenode Preview Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Beautiful Themes
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from our collection of stunning themes to make your link page unique
            </p>
          </div>

          {/* Combined Interactive Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card rounded-lg shadow-lg overflow-hidden">
              {/* Treenode Preview with Theme */}
              <div className="h-[800px] relative">
                <TreenodeRenderer
                  node={getCurrentPreviewNode()}
                  links={sampleNodes[currentPersonIndex].links}
                  previewMode={true}
                  className="h-full"
                />
              </div>

              {/* Dual Navigation Controls */}
              <div className="p-6 bg-card border-t relative z-20">
                <div className="flex flex-col space-y-6">
                  {/* Theme Navigation */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Choose Theme</h4>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevTheme}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <h3 className="text-lg font-semibold capitalize">
                          {availableThemes[currentThemeIndex].replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentThemeIndex + 1} of {availableThemes.length}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextTheme}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-px bg-border"></div>
                  </div>

                  {/* Person Navigation */}
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Example Profile</h4>
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevPerson}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex-1 text-center">
                        <h3 className="text-lg font-semibold">
                          {sampleNodes[currentPersonIndex].node.display_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {sampleNodes[currentPersonIndex].node.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentPersonIndex + 1} of {sampleNodes.length}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPerson}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Get Started
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your account and start building your personalized link page in minutes.
          </p>
          <div className="bg-card rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">
              Start 100% free — make an account, start your page
            </h3>
            <Button 
              size="lg"
              onClick={() => router.push('/register')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your Page
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            It&apos;s Open Source
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Treenode is built with transparency and community in mind. The entire codebase is open source, 
            allowing you to inspect, contribute, and even self-host your own Treenode instance if desired.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.open('https://github.com/akramboussanni/treenode', '_blank')}
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => window.open('https://github.com/akramboussanni/treenode/blob/main/README.md', '_blank')}
            >
              <Code className="mr-2 h-5 w-5" />
              Self-Host Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Link className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Treenode</span>
          </div>
          <p className="text-muted-foreground mb-2">
            Made with ❤️ by the open source community
          </p>
          <p className="text-sm text-muted-foreground">
            by akramboussanni
          </p>
        </div>
      </footer>
    </div>
  );
}
