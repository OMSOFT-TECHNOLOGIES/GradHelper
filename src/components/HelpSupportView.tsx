import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  Shield,
  Zap,
  Users,
  BookOpen,
  LifeBuoy,
  Star,
  AlertCircle,
  Download,
  PlayCircle,
  ArrowRight,
  Headphones,
  Globe,
  Award,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Database,
  Server,
  Wifi,
  Lock
 } from 'lucide-react';

interface HelpSupportViewProps {
  onViewChange?: (view: string) => void;
}

export function HelpSupportView({ onViewChange }: HelpSupportViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleContactAction = (action: string, method: any) => {
    switch (action) {
      case 'Send Email':
        window.location.href = `mailto:${method.description}`;
        break;
      case 'Start Chat':
        // Navigate to chat with admin page using onViewChange if available
        if (onViewChange) {
          onViewChange('chat');
        } else {
          window.location.href = '/chat';
        }
        break;
      case 'Call Now':
        window.location.href = `tel:${method.description}`;
        break;
      default:
        break;
    }
  };

  const faqItems = [
    {
      id: 'posting-tasks',
      question: 'How do I post a new task or assignment?',
      answer: 'To post a task, navigate to the "Post Task" section from your dashboard. Fill in the task details including title, description, deadline, and any specific requirements. You can also upload reference materials and set your budget.'
    },
    {
      id: 'finding-experts',
      question: 'How are experts matched to my tasks?',
      answer: 'Currently all tasks are handled by our in-house team of academic experts. In the future, we plan to implement an expert matching algorithm that considers factors such as expertise, past performance, and availability to ensure the best fit for your assignments.'
    },
    {
      id: 'payments',
      question: 'How does the payment system work?',
      answer: 'Payments are processed securely through our platform using Stripe. You can pay by card or bank transfer. Payment is currently not held in escrow because all tasks are completed by our in-house experts. You can request refunds within 14 days if you are not satisfied with the delivered work.'
    },
    {
      id: 'deliverables',
      question: 'What happens if I need revisions?',
      answer: 'We offer one free revision. Additional revisions can be requested and will be charged separately. You can discuss revision requirements directly with your assigned expert.'
    },
    {
      id: 'partnerships',
      question: 'How do I join the partnership program?',
      answer: 'Apply through the Partnerships section. You need to demonstrate relevant expertise and provide samples of your work. Successful applicants earn 10% commission on referred students plus bonuses for high-quality work.'
    }
  ];

  const guideContent = {
    'getting-started': {
      'quick-start': {
        title: 'Quick Start Guide',
        content: `
          <h2>Welcome to TheGradHelper!</h2>
          <p>This quick start guide will help you get up and running in just a few minutes.</p>
          
          <h3>Step 1: Complete Your Profile</h3>
          <p>Start by filling out your profile information to help our experts understand your academic needs.</p>
          <ul>
            <li>Add your academic level and field of study</li>
            <li>Upload a profile picture or use your initials</li>
            <li>Set your preferred communication methods</li>
          </ul>
          
          <h3>Step 2: Post Your First Task</h3>
          <p>Ready to get help? Click the "Post New Task" button and:</p>
          <ul>
            <li>Describe your assignment clearly</li>
            <li>Set your deadline</li>
            <li>Upload any reference materials</li>
            <li>Choose your budget range</li>
          </ul>
          
          <h3>Step 3: Connect with Experts</h3>
          <p>Our in-house team of academic experts will review your task and get started immediately.</p>
          
          <h3>Step 4: Track Progress</h3>
          <p>Use your dashboard to monitor task progress and communicate with your assigned expert.</p>
        `
      },
      'account-setup': {
        title: 'Account Setup',
        content: `
          <h2>Setting Up Your Account</h2>
          <p>Complete account setup ensures the best experience on our platform.</p>
          
          <h3>Profile Information</h3>
          <p>Fill out all required profile fields:</p>
          <ul>
            <li><strong>Name:</strong> Your real name for personalized service</li>
            <li><strong>Email:</strong> Primary communication channel</li>
            <li><strong>Academic Level:</strong> Undergraduate, Graduate, PhD, etc.</li>
            <li><strong>Field of Study:</strong> Your major or area of focus</li>
          </ul>
          
          <h3>Notification Preferences</h3>
          <p>Configure how you want to receive updates:</p>
          <ul>
            <li>Email notifications for task updates</li>
            <li>SMS alerts for urgent messages</li>
            <li>Browser push notifications</li>
          </ul>
          
          <h3>Payment Methods</h3>
          <p>Add secure payment methods for seamless transactions:</p>
          <ul>
            <li>Credit/Debit cards</li>
            <li>PayPal integration</li>
            <li>Bank transfer options</li>
          </ul>
        `
      },
      'first-task': {
        title: 'First Task Walkthrough',
        content: `
          <h2>Your First Task - Step by Step</h2>
          <p>Let's walk through posting your first task to ensure success.</p>
          
          <h3>Before You Start</h3>
          <ul>
            <li>Gather all assignment materials</li>
            <li>Know your deadline</li>
            <li>Have a clear idea of your budget</li>
            <li>Prepare any specific requirements</li>
          </ul>
          
          <h3>Task Details</h3>
          <p>Provide comprehensive information:</p>
          <ul>
            <li><strong>Title:</strong> Clear, descriptive task name</li>
            <li><strong>Type:</strong> Essay, Research, Problem Set, etc.</li>
            <li><strong>Subject:</strong> Your academic field</li>
            <li><strong>Description:</strong> Detailed requirements and expectations</li>
          </ul>
          
          <h3>Files and Resources</h3>
          <p>Upload supporting materials:</p>
          <ul>
            <li>Assignment instructions</li>
            <li>Reading materials or textbooks</li>
            <li>Previous work or examples</li>
            <li>Rubrics or grading criteria</li>
          </ul>
          
          <h3>Review and Submit</h3>
          <p>Double-check everything before submission:</p>
          <ul>
            <li>Verify deadline accuracy</li>
            <li>Confirm budget and payment method</li>
            <li>Review all uploaded files</li>
            <li>Submit and await expert assignment</li>
          </ul>
        `
      },
      'platform-overview': {
        title: 'Platform Overview',
        content: `
          <h2>Understanding TheGradHelper Platform</h2>
          <p>Get familiar with all the features and tools available to you.</p>
          
          <h3>Dashboard</h3>
          <p>Your central command center:</p>
          <ul>
            <li>Task overview and statistics</li>
            <li>Recent activity and updates</li>
            <li>Quick action buttons</li>
            <li>Upcoming deadlines</li>
          </ul>
          
          <h3>Task Management</h3>
          <p>Track and manage your assignments:</p>
          <ul>
            <li>Active tasks with progress indicators</li>
            <li>Completed work archive</li>
            <li>Communication history</li>
            <li>File downloads and submissions</li>
          </ul>
          
          <h3>Expert Network</h3>
          <p>Connect with our academic experts:</p>
          <ul>
            <li>In-house team of qualified professionals</li>
            <li>Direct messaging and communication</li>
            <li>Progress updates and notifications</li>
            <li>Quality assurance processes</li>
          </ul>
          
          <h3>Partnership Program</h3>
          <p>Earn while you learn:</p>
          <ul>
            <li>Refer friends and earn commissions</li>
            <li>Quality bonuses for excellent work</li>
            <li>Exclusive partner benefits</li>
          </ul>
        `
      }
    },
    'advanced': {
      'partnership-program': {
        title: 'Partnership Program',
        content: `
          <h2>Join Our Partnership Program</h2>
          <p>Earn money by referring students and providing quality academic assistance.</p>
          
          <h3>How It Works</h3>
          <ul>
            <li>Apply through the Partnerships section</li>
            <li>Demonstrate your expertise with work samples</li>
            <li>Get approved and start earning</li>
            <li>Receive 10% commission on referrals</li>
          </ul>
          
          <h3>Requirements</h3>
          <ul>
            <li>Academic qualification in your field</li>
            <li>Portfolio of previous work</li>
            <li>Strong communication skills</li>
            <li>Commitment to quality and deadlines</li>
          </ul>
          
          <h3>Benefits</h3>
          <ul>
            <li>Flexible working hours</li>
            <li>Competitive compensation</li>
            <li>Professional development opportunities</li>
            <li>Access to exclusive resources</li>
          </ul>
        `
      },
      'expert-matching': {
        title: 'Expert Matching',
        content: `
          <h2>How Expert Matching Works</h2>
          <p>Learn about our process for connecting you with the right academic expert.</p>
          
          <h3>Current System</h3>
          <p>All tasks are handled by our in-house team of academic experts who are:</p>
          <ul>
            <li>Thoroughly vetted and qualified</li>
            <li>Experienced in diverse academic fields</li>
            <li>Committed to quality and deadlines</li>
            <li>Available for direct communication</li>
          </ul>
          
          <h3>Future Enhancements</h3>
          <p>We're developing an advanced matching algorithm that will consider:</p>
          <ul>
            <li>Expert specialization and expertise</li>
            <li>Past performance and ratings</li>
            <li>Availability and workload</li>
            <li>Communication style preferences</li>
          </ul>
        `
      },
      'quality-assurance': {
        title: 'Quality Assurance',
        content: `
          <h2>Our Quality Assurance Process</h2>
          <p>Understanding how we ensure high-quality deliverables for every task.</p>
          
          <h3>Expert Vetting</h3>
          <ul>
            <li>Rigorous application process</li>
            <li>Academic credential verification</li>
            <li>Work sample evaluation</li>
            <li>Ongoing performance monitoring</li>
          </ul>
          
          <h3>Work Review Process</h3>
          <ul>
            <li>Initial quality check by supervisors</li>
            <li>Plagiarism detection and prevention</li>
            <li>Format and style verification</li>
            <li>Final review before delivery</li>
          </ul>
          
          <h3>Revision Policy</h3>
          <ul>
            <li>One free revision included</li>
            <li>Additional revisions available</li>
            <li>Clear revision guidelines</li>
            <li>Quality guarantee on all work</li>
          </ul>
        `
      },
      'advanced-search': {
        title: 'Advanced Search',
        content: `
          <h2>Advanced Search Features</h2>
          <p>Make the most of our search capabilities to find exactly what you need.</p>
          
          <h3>Search Filters</h3>
          <ul>
            <li>Filter by task type and subject</li>
            <li>Date range selection</li>
            <li>Status and priority filtering</li>
            <li>Expert and rating filters</li>
          </ul>
          
          <h3>Smart Search</h3>
          <ul>
            <li>Natural language queries</li>
            <li>Keyword highlighting</li>
            <li>Search history and suggestions</li>
            <li>Saved search preferences</li>
          </ul>
        `
      }
    },
    'troubleshooting': {
      'login-issues': {
        title: 'Login Issues',
        content: `
          <h2>Troubleshooting Login Problems</h2>
          <p>Common solutions for login and authentication issues.</p>
          
          <h3>Forgot Password</h3>
          <ul>
            <li>Click "Forgot Password" on login page</li>
            <li>Enter your registered email</li>
            <li>Check email for reset link</li>
            <li>Create a new secure password</li>
          </ul>
          
          <h3>Account Locked</h3>
          <ul>
            <li>Wait 15 minutes for automatic unlock</li>
            <li>Contact support for immediate assistance</li>
            <li>Verify email address accuracy</li>
          </ul>
        `
      },
      'payment-problems': {
        title: 'Payment Problems',
        content: `
          <h2>Resolving Payment Issues</h2>
          
          <h3>Payment Declined</h3>
          <ul>
            <li>Verify card details and expiry</li>
            <li>Check available balance</li>
            <li>Try alternative payment method</li>
            <li>Contact your bank if needed</li>
          </ul>
          
          <h3>Refund Requests</h3>
          <ul>
            <li>14-day refund policy</li>
            <li>Submit request through support</li>
            <li>Provide detailed reasoning</li>
            <li>Processing takes 3-5 business days</li>
          </ul>
        `
      },
      'file-upload': {
        title: 'File Upload Errors',
        content: `
          <h2>File Upload Troubleshooting</h2>
          
          <h3>Supported File Types</h3>
          <ul>
            <li>Documents: PDF, DOC, DOCX, TXT</li>
            <li>Images: JPG, PNG, GIF</li>
            <li>Spreadsheets: XLS, XLSX, CSV</li>
            <li>Maximum file size: 50MB</li>
          </ul>
          
          <h3>Common Issues</h3>
          <ul>
            <li>Check file size limits</li>
            <li>Ensure stable internet connection</li>
            <li>Try different browser</li>
            <li>Clear browser cache</li>
          </ul>
        `
      },
      'notifications': {
        title: 'Notification Settings',
        content: `
          <h2>Managing Your Notifications</h2>
          
          <h3>Email Notifications</h3>
          <ul>
            <li>Task status updates</li>
            <li>New message alerts</li>
            <li>Payment confirmations</li>
            <li>Deadline reminders</li>
          </ul>
          
          <h3>Browser Notifications</h3>
          <ul>
            <li>Real-time message alerts</li>
            <li>Task completion notices</li>
            <li>System announcements</li>
          </ul>
        `
      }
    }
  };

  const handleGuideClick = (category: string, guideKey: string) => {
    setSelectedCategory(category);
    setSelectedGuide(guideKey);
  };

  const handleBackToGuides = () => {
    setSelectedGuide(null);
    setSelectedCategory(null);
  };

  const helpTopics = [
    { icon: FileText, title: 'Getting Started Guide', description: 'Learn the basics of using TheGradHelper' },
    { icon: MessageCircle, title: 'Task Management', description: 'How to post, track, and manage your assignments' },
    { icon: Phone, title: 'Payment & Billing', description: 'Understanding payments, refunds, and billing' },
    { icon: HelpCircle, title: 'Partnership Program', description: 'Join our network of academic experts' }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'thegradhelper@gmail.com',
      note: 'Response within 24 hours',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+44 7985 733795',
      note: 'Mon-Fri, 9AM-6PM GMT',
      action: 'Call Now'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      note: 'Available during business hours',
      action: 'Start Chat'
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LifeBuoy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Help & Support Center
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Get the help you need to succeed. Our comprehensive support resources, expert guidance, 
                and 24/7 assistance ensure you're never alone in your academic journey.
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">24/7</span>
                  <Headphones className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">Support Available</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">&lt;2hrs</span>
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">Avg Response Time</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">98%</span>
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
                <p className="text-gray-600 font-medium">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <TabsTrigger value="faq" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200">
              <BookOpen className="w-4 h-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-200">
              <Server className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
          </TabsList>

        {/* FAQ Section */}
        <TabsContent value="faq" className="space-y-6">
          {/* Popular Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, title: "Getting Started", count: 12, color: "bg-blue-50 text-blue-700 border-blue-200" },
              { icon: Users, title: "Account & Profile", count: 8, color: "bg-green-50 text-green-700 border-green-200" },
              { icon: Shield, title: "Security & Privacy", count: 6, color: "bg-purple-50 text-purple-700 border-purple-200" },
              { icon: TrendingUp, title: "Billing & Payments", count: 10, color: "bg-orange-50 text-orange-700 border-orange-200" }
            ].map((topic, index) => (
              <Card key={index} className={`cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border ${topic.color}`}>
                <CardContent className="p-6 text-center">
                  <topic.icon className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{topic.title}</h3>
                  <p className="text-sm opacity-75">{topic.count} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="border border-gray-200 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl font-semibold flex items-center">
                <HelpCircle className="w-6 h-6 mr-3" />
                Frequently Asked Questions
              </CardTitle>
              <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20 focus:border-white/40"
                />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredFAQ.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <AccordionTrigger className="text-left px-6 py-4 hover:bg-gray-50 font-semibold text-gray-900">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or browse popular topics above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Section */}
        <TabsContent value="guides" className="space-y-8">
          {/* Guide Content Display */}
          {(() => {
            if (!selectedGuide || !selectedCategory) return null;
            const categoryContent = guideContent[selectedCategory as keyof typeof guideContent];
            if (!categoryContent) return null;
            const guide = (categoryContent as any)[selectedGuide];
            if (!guide) return null;
            
            return (
              <Card className="border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                      {guide.title}
                    </CardTitle>
                  <Button 
                    variant="ghost" 
                    onClick={handleBackToGuides}
                    className="text-white hover:bg-white/20 rounded-xl"
                  >
                    ← Back to Guides
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  className="prose prose-lg max-w-none"
                  style={{
                    color: '#4b5563',
                    lineHeight: '1.75'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: guide.content 
                  }}
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .prose h2 {
                      color: #1e40af !important;
                      font-size: 1.875rem !important;
                      font-weight: 700 !important;
                      margin-bottom: 1rem !important;
                      margin-top: 2rem !important;
                    }
                    .prose h3 {
                      color: #374151 !important;
                      font-size: 1.5rem !important;
                      font-weight: 600 !important;
                      margin-bottom: 0.75rem !important;
                      margin-top: 1.5rem !important;
                    }
                    .prose p {
                      color: #4b5563 !important;
                      line-height: 1.75 !important;
                      margin-bottom: 1rem !important;
                    }
                    .prose ul {
                      color: #4b5563 !important;
                      margin-bottom: 1rem !important;
                      padding-left: 1.5rem !important;
                    }
                    .prose li {
                      margin-bottom: 0.5rem !important;
                      line-height: 1.6 !important;
                    }
                    .prose strong {
                      color: #1f2937 !important;
                      font-weight: 600 !important;
                    }
                  `
                }}/>
              </CardContent>
            </Card>
            );
          })() || (
            <>
              {/* Resource Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <BookOpen className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Getting Started</h3>
                <p className="text-blue-100">Essential guides for new users</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  { title: "Quick Start Guide", time: "5 min read", icon: PlayCircle, key: "quick-start" },
                  { title: "Account Setup", time: "3 min read", icon: Settings, key: "account-setup" },
                  { title: "First Task Walkthrough", time: "10 min read", icon: ArrowRight, key: "first-task" },
                  { title: "Platform Overview", time: "8 min read", icon: Globe, key: "platform-overview" }
                ].map((guide, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleGuideClick('getting-started', guide.key)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <guide.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600">{guide.title}</p>
                        <p className="text-sm text-gray-500">{guide.time}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
                <Award className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Advanced Features</h3>
                <p className="text-green-100">Maximize your platform usage</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  { title: "Partnership Program", time: "12 min read", icon: Users, key: "partnership-program" },
                  { title: "Expert Matching", time: "6 min read", icon: Star, key: "expert-matching" },
                  { title: "Quality Assurance", time: "8 min read", icon: Shield, key: "quality-assurance" },
                  { title: "Advanced Search", time: "4 min read", icon: Search, key: "advanced-search" }
                ].map((guide, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleGuideClick('advanced', guide.key)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <guide.icon className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-green-600">{guide.title}</p>
                        <p className="text-sm text-gray-500">{guide.time}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                <AlertCircle className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-bold mb-2">Troubleshooting</h3>
                <p className="text-orange-100">Solve common issues quickly</p>
              </div>
              <CardContent className="p-6 space-y-4">
                {[
                  { title: "Login Issues", time: "3 min read", icon: Lock, key: "login-issues" },
                  { title: "Payment Problems", time: "5 min read", icon: AlertCircle, key: "payment-problems" },
                  { title: "File Upload Errors", time: "4 min read", icon: Download, key: "file-upload" },
                  { title: "Notification Settings", time: "2 min read", icon: Bell, key: "notifications" }
                ].map((guide, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleGuideClick('troubleshooting', guide.key)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <guide.icon className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-orange-600">{guide.title}</p>
                        <p className="text-sm text-gray-500">{guide.time}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
              </div>
              
              {/* Download Resources */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Download Our Complete Guide</h3>
                      <p className="text-gray-600 text-lg mb-4">Everything you need to succeed with TheGradHelper in one comprehensive PDF guide.</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> 50+ pages</span>
                        <span className="flex items-center gap-1"><Download className="w-4 h-4" /> Free download</span>
                        <span className="flex items-center gap-1"><Star className="w-4 h-4" /> Updated weekly</span>
                      </div>
                    </div>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                      <Download className="w-5 h-5 mr-2" />
                      Download Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact" className="space-y-8">
          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                    index === 0 ? 'bg-blue-600 group-hover:bg-blue-700' :
                    index === 1 ? 'bg-green-600 group-hover:bg-green-700' :
                    'bg-purple-600 group-hover:bg-purple-700'
                  } transition-colors duration-300`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-lg font-mono text-gray-700 mb-2">{method.description}</p>
                  <p className="text-sm text-gray-500 mb-6">{method.note}</p>
                  
                  <Button 
                    onClick={() => handleContactAction(method.action, method)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                      index === 0 ? 'bg-blue-600 hover:bg-blue-700' :
                      index === 1 ? 'bg-green-600 hover:bg-green-700' :
                      'bg-purple-600 hover:bg-purple-700'
                    }`}>
                    {method.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Support Information */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Response Times */}
              <Card className="border border-green-200 bg-green-50 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Response Times
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700"> Urgent</span>
                      <span className="font-semibold text-green-800">&lt; 1 hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700"> High Priority</span>
                      <span className="font-semibold text-green-800">&lt; 4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700"> Medium Priority</span>
                      <span className="font-semibold text-green-800">&lt; 24 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700"> Low Priority</span>
                      <span className="font-semibold text-green-800">&lt; 48 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Support Hours */}
              <Card className="border border-blue-200 bg-blue-50 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Support Hours
                  </h3>
                  <div className="space-y-2 text-blue-700">
                    <p><strong>Live Chat:</strong> 24/7 Available</p>
                    <p><strong>Phone Support:</strong> Mon-Fri 9AM-6PM GMT</p>
                    <p><strong>Email Support:</strong> 24/7 Available</p>
                    <p className="text-sm text-blue-600 mt-4">
                      *Emergency support available 24/7 for urgent issues
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Additional Resources */}
              <Card className="border border-purple-200 bg-purple-50 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Before You Contact Us
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-purple-100 transition-colors border border-purple-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-medium group-hover:text-purple-800">Check our FAQ</span>
                        <ArrowRight className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                      </div>
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-purple-100 transition-colors border border-purple-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-medium group-hover:text-purple-800">Search help guides</span>
                        <ArrowRight className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                      </div>
                    </button>
                    <button className="w-full text-left p-3 bg-white rounded-xl hover:bg-purple-100 transition-colors border border-purple-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-medium group-hover:text-purple-800">Check system status</span>
                        <ArrowRight className="w-4 h-4 text-purple-500 group-hover:text-purple-600" />
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* System Status */}
        <TabsContent value="status" className="space-y-6">
          {/* Overall Status */}
          <Card className="border border-green-200 bg-green-50 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">All Systems Operational</h2>
                    <p className="text-green-600 text-lg">All services are running smoothly with 99.9% uptime</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-800">99.9%</div>
                  <div className="text-green-600 font-medium">Uptime (30 days)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { service: 'API Gateway', status: 'operational', icon: Server, response: '45ms' },
              { service: 'Database', status: 'operational', icon: Database, response: '12ms' },
              { service: 'Authentication', status: 'operational', icon: Lock, response: '89ms' },
              { service: 'File Storage', status: 'operational', icon: FileText, response: '156ms' },
              { service: 'Payment System', status: 'operational', icon: Shield, response: '234ms' },
              { service: 'Notification Service', status: 'operational', icon: Bell, response: '67ms' },
              { service: 'Task Management', status: 'operational', icon: Settings, response: '78ms' },
              { service: 'Messaging System', status: 'operational', icon: MessageCircle, response: '43ms' },
              { service: 'CDN Network', status: 'operational', icon: Wifi, response: '23ms' }
            ].map((item, index) => (
              <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <item.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.service}</h3>
                        <p className="text-sm text-gray-500">Response: {item.response}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Operational
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">98% uptime this month</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Times */}
            <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Average Response Time</span>
                    <span className="font-bold text-blue-600">127ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Peak Response Time</span>
                    <span className="font-bold text-orange-600">456ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Success Rate</span>
                    <span className="font-bold text-green-600">99.97%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Active Users</span>
                    <span className="font-bold text-purple-600">2,847</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Updates */}
            <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { date: 'Nov 23, 2025', event: 'Performance optimization deployed', type: 'improvement' },
                    { date: 'Nov 22, 2025', event: 'Security patch applied', type: 'security' },
                    { date: 'Nov 21, 2025', event: 'Database maintenance completed', type: 'maintenance' },
                    { date: 'Nov 20, 2025', event: 'New features released', type: 'feature' }
                  ].map((update, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-3 h-3 rounded-full ${
                        update.type === 'improvement' ? 'bg-blue-500' :
                        update.type === 'security' ? 'bg-red-500' :
                        update.type === 'maintenance' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{update.event}</p>
                        <p className="text-xs text-gray-500">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Status Footer */}
          <Card className="bg-gray-50 border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Last updated: {new Date().toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Operational
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    Degraded
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Outage
                  </span>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Status Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}