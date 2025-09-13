import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
  CheckCircle
} from 'lucide-react';
import { toast } from "sonner";

export function HelpSupportView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqItems = [
    {
      id: 'posting-tasks',
      question: 'How do I post a new task or assignment?',
      answer: 'To post a task, navigate to the "Post Task" section from your dashboard. Fill in the task details including title, description, deadline, and any specific requirements. You can also upload reference materials and set your budget.'
    },
    {
      id: 'finding-experts',
      question: 'How are experts matched to my tasks?',
      answer: 'Our system matches tasks to qualified experts based on subject expertise, availability, and past performance ratings. You will receive proposals from interested experts within 24 hours of posting.'
    },
    {
      id: 'payments',
      question: 'How does the payment system work?',
      answer: 'Payments are processed securely through our platform. You can pay by card or bank transfer. Payment is held in escrow and released to the expert upon successful completion and your approval.'
    },
    {
      id: 'deliverables',
      question: 'What happens if I need revisions?',
      answer: 'Most experts offer one free revision. Additional revisions can be requested and will be charged separately. You can discuss revision requirements directly with your assigned expert.'
    },
    {
      id: 'partnerships',
      question: 'How do I join the partnership program?',
      answer: 'Apply through the Partnerships section. You need to demonstrate relevant expertise and provide samples of your work. Successful applicants earn 10% commission on referred students plus bonuses for high-quality work.'
    }
  ];

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
      description: 'iconmaxwells@gmail.com',
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Support request submitted!', {
        description: 'We will get back to you within 24 hours.'
      });
      setContactForm({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* FAQ Section */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQ items found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guides Section */}
        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <topic.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {topic.description}
                      </p>
                      <Button variant="outline" size="sm" className="gap-2">
                        View Guide
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <method.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{method.title}</h4>
                      <p className="text-sm font-mono">{method.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{method.note}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {method.action}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please describe your issue or question in detail..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Status */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">All Systems Operational</p>
                  <p className="text-sm text-green-600">All services are running normally</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { service: 'Task Management', status: 'operational' },
                  { service: 'Payment Processing', status: 'operational' },
                  { service: 'File Uploads', status: 'operational' },
                  { service: 'Messaging System', status: 'operational' },
                  { service: 'Authentication', status: 'operational' },
                  { service: 'Notifications', status: 'operational' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{item.service}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}