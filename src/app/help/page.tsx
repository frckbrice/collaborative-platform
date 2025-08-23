'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  FileText,
  Settings,
  CreditCard,
  Zap,
  Shield,
  Globe,
  Smartphone,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ArrowRight,
  CheckCircle,
  Star,
  Rocket,
  Target,
  FolderOpen,
  PenTool,
  Clock,
  Search,
  Download,
  Upload,
  Share2,
  Eye,
  Lock,
  Unlock,
  Plus,
  Minus,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <HelpCircle className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Complete Dashboard & App Usage Guide
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Master your collaborative workspace platform with this comprehensive guide. Learn how to
            create, collaborate, and manage your projects in real-time.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              🚀 Real-Time Collaboration
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              📱 Cross-Platform
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              🔒 Secure & Private
            </Badge>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Account creation and first steps</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>Team management and real-time editing</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>Pro tips and customization</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Support</CardTitle>
              <CardDescription>Help and troubleshooting</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Getting Started Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              🚀 Getting Started
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Follow these steps to get up and running with your collaborative workspace
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Account Creation & Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Visit your app&apos;s homepage</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Navigate to the main landing page
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Sign Up with email/password or OAuth</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Google or GitHub integration available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Choose your plan</p>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-1">
                        <p>
                          • <strong>Free Plan:</strong> 2 collaborators max, basic features
                        </p>
                        <p>
                          • <strong>Pro Plan:</strong> Unlimited collaborators, advanced features
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        4
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Complete secure payment</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Stripe integration for safe transactions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                  First Login Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Dashboard Setup</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Welcome screen for first-time users
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Create Workspace</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Set up your first collaborative workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Choose Template</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Start with blank or use templates
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        4
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Set Permissions</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Private or collaborative workspace
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Workspace Management Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              🏢 Workspace Management
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Organize your projects and team collaboration effectively
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-purple-600" />
                  Creating a Workspace
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Click &quot;Create Workspace&quot; button</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Enter workspace details</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Name, icon, and initial permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Add collaborators (optional)</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Search by email and invite team members
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Set access levels</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Owner, editor, or viewer permissions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Search className="w-6 h-6 text-orange-600" />
                  Workspace Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
                  <div className="text-slate-600 dark:text-slate-400">
                    📁 Marketing Team Projects
                  </div>
                  <div className="ml-4 text-slate-600 dark:text-slate-400">
                    ├── 🎨 Brand Guidelines
                  </div>
                  <div className="ml-4 text-slate-600 dark:text-slate-400">
                    ├── 📊 Campaign Strategy
                  </div>
                  <div className="ml-4 text-slate-600 dark:text-slate-400">
                    ├── 📅 Content Calendar
                  </div>
                  <div className="ml-4 text-slate-600 dark:text-slate-400">
                    └── 📁 Design Assets
                  </div>
                  <div className="ml-8 text-slate-600 dark:text-slate-400">
                    ├── 📄 Logo Variations
                  </div>
                  <div className="ml-8 text-slate-600 dark:text-slate-400">
                    └── 📄 Social Media Templates
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Plan Comparison Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              💳 Subscription & Billing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose the plan that fits your team&apos;s needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <CardDescription>Perfect for small teams getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>2 collaborators max</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>1GB storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>1 workspace</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>7 days version history</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Minus className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400">Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Minus className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400">Advanced features</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 dark:border-blue-400 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <CardDescription>For growing teams and businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">$19</span>
                  <span className="text-slate-600 dark:text-slate-400">/month</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Unlimited collaborators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>100GB storage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Unlimited workspaces</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>1 year version history</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Advanced features</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              🆘 Support & Help
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Get help when you need it</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>In-App Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Chat with our support team directly from the app
                </p>
                <Button variant="outline" className="w-full">
                  Start Chat
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Send detailed questions to our support team
                </p>
                <Button variant="outline" className="w-full">
                  Send Email
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Comprehensive guides and tutorials
                </p>
                <Button variant="outline" className="w-full">
                  Browse Docs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Collaborating?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of teams already using our platform for real-time collaboration
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-blue-600">
                  Get Started Free
                  <Rocket className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  View Demo
                  <Eye className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
