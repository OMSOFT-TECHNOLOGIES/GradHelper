import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Search, 
  Filter,
  MoreVertical,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Users,
  User,
  AlertCircle,
  Mail,
  FileText,
  Settings,
  ChevronRight,
  Download
} from 'lucide-react';
import { toast } from "sonner";

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'student' | 'admin';
  subject: string;
  content: string;
  attachments?: MessageAttachment[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'payment' | 'technical' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

interface MessageThread {
  id: string;
  subject: string;
  participantIds: string[];
  participantNames: string[];
  participantRoles: { [key: string]: 'student' | 'admin' };
  participantAvatars: { [key: string]: string };
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'payment' | 'technical' | 'urgent';
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface MessagesViewProps {
  userRole: 'student' | 'admin';
  user?: any;
}

const CATEGORIES = [
  { value: 'general', label: 'General Inquiry', color: 'bg-blue-100 text-blue-800' },
  { value: 'academic', label: 'Academic Support', color: 'bg-green-100 text-green-800' },
  { value: 'payment', label: 'Payment Issue', color: 'bg-purple-100 text-purple-800' },
  { value: 'technical', label: 'Technical Support', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent Matter', color: 'bg-red-100 text-red-800' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export function MessagesView({ userRole, user }: MessagesViewProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [isComposingNew, setIsComposingNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal' as Message['priority'],
    category: 'general' as Message['category']
  });

  // Load messages and threads from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('gradhelper_messages');
    const savedThreads = localStorage.getItem('gradhelper_message_threads');
    
    if (savedMessages && savedThreads) {
      setMessages(JSON.parse(savedMessages));
      setThreads(JSON.parse(savedThreads));
    } else {
      // Initialize with default messages for demo
      const defaultMessages = createDefaultMessages();
      const defaultThreads = createDefaultThreads(defaultMessages);
      setMessages(defaultMessages);
      setThreads(defaultThreads);
      localStorage.setItem('gradhelper_messages', JSON.stringify(defaultMessages));
      localStorage.setItem('gradhelper_message_threads', JSON.stringify(defaultThreads));
    }
  }, []);

  const createDefaultMessages = (): Message[] => {
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    
    return [
      {
        id: '1',
        threadId: 'thread-1',
        senderId: 'admin-1',
        senderName: 'Dr. Sarah Wilson',
        senderRole: 'admin',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
        recipientId: currentUserId,
        recipientName: currentUserName,
        recipientRole: userRole,
        subject: 'Welcome to TheGradHelper!',
        content: 'Welcome to TheGradHelper! We\'re excited to help you succeed in your academic journey. Our expert team is here to provide personalized support for your projects, assignments, and research. Feel free to reach out anytime you need assistance.',
        priority: 'normal',
        category: 'general',
        status: 'delivered',
        isStarred: true,
        isArchived: false,
        createdAt: '2024-12-22T09:00:00Z',
        readAt: undefined
      },
      {
        id: '2',
        threadId: 'thread-2',
        senderId: userRole === 'student' ? currentUserId : 'student-1',
        senderName: userRole === 'student' ? currentUserName : 'Emily Davis',
        senderRole: userRole === 'student' ? 'student' : 'student',
        senderAvatar: userRole === 'student' ? user?.avatar : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
        recipientId: userRole === 'student' ? 'admin-1' : currentUserId,
        recipientName: userRole === 'student' ? 'Admin Support' : currentUserName,
        recipientRole: userRole === 'student' ? 'admin' : 'admin',
        subject: 'Question about ML Project Deliverables',
        content: 'Hi! I have some questions about the deliverables for my Machine Learning project. Could you please clarify the requirements for the literature review section? I want to make sure I\'m on the right track.',
        priority: 'normal',
        category: 'academic',
        status: userRole === 'admin' ? 'delivered' : 'read',
        isStarred: false,
        isArchived: false,
        createdAt: '2024-12-21T14:30:00Z',
        readAt: userRole === 'admin' ? undefined : '2024-12-21T15:00:00Z'
      },
      {
        id: '3',
        threadId: 'thread-2',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : 'admin',
        senderAvatar: userRole === 'student' ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face' : user?.avatar,
        recipientId: userRole === 'student' ? currentUserId : 'student-1',
        recipientName: userRole === 'student' ? currentUserName : 'Emily Davis',
        recipientRole: userRole === 'student' ? 'student' : 'student',
        subject: 'Re: Question about ML Project Deliverables',
        content: 'Thank you for your question! For the literature review section, please include at least 15-20 recent academic sources (published within the last 5 years). Focus on papers related to your specific ML technique and application domain. I\'ve attached a sample format for reference.',
        attachments: [
          {
            id: 'att-1',
            name: 'Literature_Review_Template.pdf',
            type: 'application/pdf',
            size: 245760,
            url: '#'
          }
        ],
        priority: 'normal',
        category: 'academic',
        status: 'read',
        isStarred: false,
        isArchived: false,
        createdAt: '2024-12-21T16:15:00Z',
        readAt: '2024-12-21T16:30:00Z',
        repliedAt: '2024-12-21T16:15:00Z'
      },
      {
        id: '4',
        threadId: 'thread-3',
        senderId: userRole === 'student' ? 'admin-2' : 'student-2',
        senderName: userRole === 'student' ? 'Finance Team' : 'John Smith',
        senderRole: userRole === 'student' ? 'admin' : 'student',
        senderAvatar: userRole === 'student' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
        recipientId: userRole === 'student' ? currentUserId : currentUserId,
        recipientName: userRole === 'student' ? currentUserName : currentUserName,
        recipientRole: userRole === 'student' ? 'student' : 'admin',
        subject: 'Payment Confirmation Required',
        content: userRole === 'student' 
          ? 'We need to confirm your recent payment for the Database Design assignment. Please check your payment method and confirm the transaction.'
          : 'I\'m having trouble with my payment for the recent assignment. The transaction seems to be pending. Could you please help resolve this?',
        priority: 'high',
        category: 'payment',
        status: 'delivered',
        isStarred: false,
        isArchived: false,
        createdAt: '2024-12-20T11:20:00Z'
      }
    ];
  };

  const createDefaultThreads = (messages: Message[]): MessageThread[] => {
    const threadsMap = new Map<string, MessageThread>();
    
    messages.forEach(message => {
      if (!threadsMap.has(message.threadId)) {
        const threadMessages = messages.filter(m => m.threadId === message.threadId);
        const lastMessage = threadMessages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        const participants = Array.from(new Set([message.senderId, message.recipientId]));
        const participantNames: string[] = [];
        const participantRoles: { [key: string]: 'student' | 'admin' } = {};
        const participantAvatars: { [key: string]: string } = {};
        
        threadMessages.forEach(msg => {
          if (!participantNames.includes(msg.senderName)) {
            participantNames.push(msg.senderName);
            participantRoles[msg.senderId] = msg.senderRole;
            participantAvatars[msg.senderId] = msg.senderAvatar || '';
          }
          if (!participantNames.includes(msg.recipientName)) {
            participantNames.push(msg.recipientName);
            participantRoles[msg.recipientId] = msg.recipientRole;
            participantAvatars[msg.recipientId] = '';
          }
        });

        const unreadCount = threadMessages.filter(m => 
          m.recipientId === (user?.id || 'current-user') && m.status !== 'read'
        ).length;
        
        threadsMap.set(message.threadId, {
          id: message.threadId,
          subject: message.subject.replace(/^Re:\s*/, ''),
          participantIds: participants,
          participantNames,
          participantRoles,
          participantAvatars,
          lastMessage,
          messageCount: threadMessages.length,
          unreadCount,
          priority: lastMessage.priority,
          category: lastMessage.category,
          isStarred: threadMessages.some(m => m.isStarred),
          isArchived: threadMessages.every(m => m.isArchived),
          createdAt: threadMessages[0].createdAt,
          updatedAt: lastMessage.createdAt
        });
      }
    });
    
    return Array.from(threadsMap.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.content.trim() || !newMessage.subject.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const messageId = Date.now().toString();
    const threadId = selectedThread?.id || `thread-${Date.now()}`;
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';

    const message: Message = {
      id: messageId,
      threadId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole,
      senderAvatar: user?.avatar,
      recipientId: newMessage.recipient || (userRole === 'student' ? 'admin-1' : 'student-1'),
      recipientName: newMessage.recipient || (userRole === 'student' ? 'Admin Support' : 'Student'),
      recipientRole: userRole === 'student' ? 'admin' : 'student',
      subject: newMessage.subject,
      content: newMessage.content,
      priority: newMessage.priority,
      category: newMessage.category,
      status: 'sent',
      isStarred: false,
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    const newMessages = [message, ...messages];
    const newThreads = createDefaultThreads(newMessages);
    
    setMessages(newMessages);
    setThreads(newThreads);
    localStorage.setItem('gradhelper_messages', JSON.stringify(newMessages));
    localStorage.setItem('gradhelper_message_threads', JSON.stringify(newThreads));
    
    setNewMessage({
      recipient: '',
      subject: '',
      content: '',
      priority: 'normal',
      category: 'general'
    });
    setIsComposingNew(false);
    
    toast.success('Message sent successfully!');
  };

  const handleMarkAsRead = (threadId: string) => {
    const currentUserId = user?.id || 'current-user';
    const updatedMessages = messages.map(message => 
      message.threadId === threadId && 
      message.recipientId === currentUserId && 
      message.status !== 'read'
        ? { ...message, status: 'read' as const, readAt: new Date().toISOString() }
        : message
    );
    
    setMessages(updatedMessages);
    const updatedThreads = createDefaultThreads(updatedMessages);
    setThreads(updatedThreads);
    localStorage.setItem('gradhelper_messages', JSON.stringify(updatedMessages));
    localStorage.setItem('gradhelper_message_threads', JSON.stringify(updatedThreads));
  };

  const handleStarThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const updatedMessages = messages.map(message => 
      message.threadId === threadId
        ? { ...message, isStarred: !thread.isStarred }
        : message
    );
    
    setMessages(updatedMessages);
    const updatedThreads = createDefaultThreads(updatedMessages);
    setThreads(updatedThreads);
    localStorage.setItem('gradhelper_messages', JSON.stringify(updatedMessages));
    localStorage.setItem('gradhelper_message_threads', JSON.stringify(updatedThreads));
    
    toast.success(thread.isStarred ? 'Removed from starred' : 'Added to starred');
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return Clock;
      case 'delivered': return CheckCircle;
      case 'read': return Eye;
      default: return Clock;
    }
  };

  const filteredThreads = threads.filter(thread => {
    const currentUserId = user?.id || 'current-user';
    
    // Role-based filtering - show threads where user is participant
    if (!thread.participantIds.includes(currentUserId)) {
      return false;
    }
    
    // Status filtering
    if (filter === 'unread' && thread.unreadCount === 0) return false;
    if (filter === 'starred' && !thread.isStarred) return false;
    if (filter === 'archived' && !thread.isArchived) return false;
    
    // Category filtering
    if (categoryFilter !== 'all' && thread.category !== categoryFilter) return false;
    
    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        thread.subject.toLowerCase().includes(searchLower) ||
        thread.lastMessage.content.toLowerCase().includes(searchLower) ||
        thread.participantNames.some(name => name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const threadMessages = selectedThread 
    ? messages
        .filter(m => m.threadId === selectedThread.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  // Statistics for admin
  const stats = {
    total: threads.filter(t => t.participantIds.includes(user?.id || 'current-user')).length,
    unread: threads.filter(t => 
      t.participantIds.includes(user?.id || 'current-user') && t.unreadCount > 0
    ).length,
    urgent: threads.filter(t => 
      t.participantIds.includes(user?.id || 'current-user') && t.priority === 'urgent'
    ).length,
    starred: threads.filter(t => 
      t.participantIds.includes(user?.id || 'current-user') && t.isStarred
    ).length
  };

  return (
    <div className="messages-view">
      <div className="messages-header">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'admin' 
                ? 'Communicate with students and provide support'
                : 'Get help and updates from our expert team'
              }
            </p>
          </div>
          
          <Dialog open={isComposingNew} onOpenChange={setIsComposingNew}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>
                  Send a message to {userRole === 'student' ? 'admin support' : 'a student'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {userRole === 'admin' && (
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select 
                      value={newMessage.recipient} 
                      onValueChange={(value) => setNewMessage({ ...newMessage, recipient: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student-1">Emily Davis</SelectItem>
                        <SelectItem value="student-2">John Smith</SelectItem>
                        <SelectItem value="student-3">Sarah Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newMessage.category} 
                      onValueChange={(value: Message['category']) => 
                        setNewMessage({ ...newMessage, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newMessage.priority} 
                      onValueChange={(value: Message['priority']) => 
                        setNewMessage({ ...newMessage, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Enter message subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder="Write your message here..."
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsComposingNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-xl font-semibold">{stats.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-xl font-semibold">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Starred</p>
                  <p className="text-xl font-semibold">{stats.starred}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="messages-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="thread-list lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <CardDescription>
                {filteredThreads.length} conversation{filteredThreads.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredThreads.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                    <p className="text-gray-600 mb-4">
                      No messages match your current filters.
                    </p>
                    <Button onClick={() => setIsComposingNew(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredThreads.map((thread) => {
                      const isSelected = selectedThread?.id === thread.id;
                      const categoryInfo = getCategoryInfo(thread.category);
                      const priorityInfo = getPriorityInfo(thread.priority);
                      const StatusIcon = getStatusIcon(thread.lastMessage.status);
                      
                      return (
                        <div
                          key={thread.id}
                          className={`thread-item p-4 border-b cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedThread(thread);
                            handleMarkAsRead(thread.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="avatar w-10 h-10 flex-shrink-0">
                              <img 
                                src={
                                  thread.participantAvatars[
                                    thread.participantIds.find(id => id !== (user?.id || 'current-user')) || ''
                                  ] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
                                } 
                                alt="Participant"
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {thread.participantNames
                                    .filter(name => name !== (user?.name || 'Current User'))
                                    .join(', ') || 'Unknown Participant'}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3 text-gray-400" />
                                  {thread.unreadCount > 0 && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                      {thread.unreadCount}
                                    </Badge>
                                  )}
                                  {thread.isStarred && (
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  )}
                                </div>
                              </div>
                              
                              <h5 className="text-sm font-medium text-gray-700 mb-1 truncate">
                                {thread.subject}
                              </h5>
                              
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {thread.lastMessage.content}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${categoryInfo.color} text-xs`}>
                                    {categoryInfo.label}
                                  </Badge>
                                  {thread.priority !== 'normal' && (
                                    <Badge className={`${priorityInfo.color} text-xs`}>
                                      {priorityInfo.label}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(thread.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="message-detail lg:col-span-2">
          {selectedThread ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedThread.subject}</CardTitle>
                    <CardDescription>
                      {selectedThread.messageCount} message{selectedThread.messageCount !== 1 ? 's' : ''} • 
                      {selectedThread.participantNames
                        .filter(name => name !== (user?.name || 'Current User'))
                        .join(', ')}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStarThread(selectedThread.id)}
                    >
                      <Star className={`w-4 h-4 ${selectedThread.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="messages-container flex-1 overflow-y-auto mb-4 space-y-4">
                  {threadMessages.map((message) => {
                    const isCurrentUser = message.senderId === (user?.id || 'current-user');
                    const StatusIcon = getStatusIcon(message.status);
                    
                    return (
                      <div
                        key={message.id}
                        className={`message-item flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="avatar w-8 h-8 flex-shrink-0">
                          <img 
                            src={message.senderAvatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`} 
                            alt={message.senderName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        
                        <div className={`message-bubble max-w-xs lg:max-w-md ${
                          isCurrentUser 
                            ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                            : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                        } p-3`}>
                          <div className="message-header mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {message.senderName}
                              </span>
                              <Badge className={`${getCategoryInfo(message.category).color} text-xs`}>
                                {getCategoryInfo(message.category).label}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm leading-relaxed mb-2">
                            {message.content}
                          </p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="attachments space-y-2 mb-2">
                              {message.attachments.map((attachment) => (
                                <div 
                                  key={attachment.id}
                                  className={`attachment flex items-center gap-2 p-2 rounded ${
                                    isCurrentUser ? 'bg-blue-700' : 'bg-gray-200'
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="text-xs font-medium truncate flex-1">
                                    {attachment.name}
                                  </span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-between text-xs ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isCurrentUser && (
                              <StatusIcon className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Reply Form */}
                <div className="reply-form border-t pt-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your reply..."
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ 
                        ...newMessage, 
                        content: e.target.value,
                        subject: `Re: ${selectedThread.subject}`,
                        recipient: selectedThread.participantIds.find(id => id !== (user?.id || 'current-user')) || ''
                      })}
                      rows={3}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!newMessage.content.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a conversation from the list to view messages
                </p>
                <Button onClick={() => setIsComposingNew(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}