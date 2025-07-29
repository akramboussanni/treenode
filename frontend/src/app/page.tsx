'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Globe, 
  Heart, 
  Star,
  Coffee,
  Github,
  Code,
  User,
  Plus,
  Palette,
  Link,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';
import Head from 'next/head';

export default function LandingPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // Handle logout error if needed
    }
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
        <title>Beautiful Link Nodes</title>
        <meta name="description" content="Create stunning, customizable link nodes that showcase your online presence" />
      </Head>

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between node-header-flex">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
              >
                <h1 className="text-2xl font-bold text-foreground node-header-title">Treenode</h1>
              </button>
              {user && <Badge variant="secondary">Home</Badge>}
            </div>
            <div className="flex items-center space-x-4 node-header-actions">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
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
                    className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream"
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
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 opacity-10">
          <Heart className="h-8 w-8 text-cottage-brown animate-pulse" />
        </div>
        <div className="absolute top-32 right-20 opacity-10">
          <Star className="h-6 w-6 text-cottage-green animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-10">
          <Coffee className="h-6 w-6 text-cottage-pink animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              <Code className="h-3 w-3 mr-1" />
              Open Source
            </Badge>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground font-serif mb-6">
            <span className="text-cottage-brown">Treenode</span>
            <br />
            Your Personal Link Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create a beautiful, customizable page that showcases all your important links in one place. Perfect for social media bios, business cards, or anywhere you want to share multiple links with a single URL.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button 
              size="lg"
              onClick={() => router.push('/register')}
              className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream btn-hover-scale"
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

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground font-serif mb-4">
              Everything you need to organize your links
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools to create and manage your link collection
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 card-hover-lift">
              <div className="flex items-start space-x-4">
                <Palette className="h-10 w-10 text-cottage-brown flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Customizable Themes</h3>
                  <p className="text-muted-foreground">
                    Choose from professional themes and customize colors to match your brand
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover-lift">
              <div className="flex items-start space-x-4">
                <Link className="h-10 w-10 text-cottage-brown flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Redirects</h3>
                  <p className="text-muted-foreground">
                    Create custom redirect URLs like yourdomain.com/instagram that automatically send visitors to your social media profiles
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-hover-lift">
              <div className="flex items-start space-x-4">
                <Globe className="h-10 w-10 text-cottage-brown flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Share Anywhere</h3>
                  <p className="text-muted-foreground">
                    Get a custom URL you can share on social media, business cards, or anywhere
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground font-serif mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to get your link page online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-cottage-brown text-cottage-cream rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign up</h3>
              <p className="text-muted-foreground">
                Create your account and join the community
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-cottage-brown text-cottage-cream rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add your links</h3>
              <p className="text-muted-foreground">
                Add your social media, website, and other important links. Create custom redirect URLs for easy sharing
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-cottage-brown text-cottage-cream rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Share your page</h3>
              <p className="text-muted-foreground">
                Get your custom URL and start sharing with the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground font-serif mb-4">
            Ready to create your link page?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the community of creators, professionals, and individuals who use Treenode to share their online presence.
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/register')}
            className="bg-cottage-brown hover:bg-cottage-brown/90 text-cottage-cream btn-hover-scale"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your Page
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Link className="h-6 w-6 text-cottage-brown" />
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
