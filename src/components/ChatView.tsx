import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './Avatar';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Info,
  Clock,
  CheckCircle,
  Check,
  Circle,
  Settings,
  Search,
  Archive,
  Star,
  VolumeX,
  Volume2,
  Image,
  File,
  Users,
  MessageCircle
} from 'lucide-react';
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'admin';
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: ChatAttachment[];
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  replyTo?: string;
}
  

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subject: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline: boolean;
  unreadCount: number;
}

interface ChatViewProps {
  userRole?: 'student' | 'admin';
  user?: any;
}

export function ChatView({ userRole = 'student', user }: ChatViewProps) {
  // State and refs (all at top)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState('Just now');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Fetch admin profile for student sidebar
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [socketWarning, setSocketWarning] = useState<string | null>(null);

  // Fetch chatId when selectedStudent changes (admin) or on mount (student)
  useEffect(() => {
    const fetchChatId = async () => {
      try {
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('gradhelper_token');
        let url = `${baseUrl}/api/auth/chats/messages`;
        if (userRole === 'admin' && selectedStudent) {
          url += `?student_id=${selectedStudent.id}`;
        } else if (userRole === 'student') {
          const userObj = JSON.parse(localStorage.getItem('gradhelper_user') || '{}');
          if (userObj.id) {
            url += `?student_id=${userObj.id}`;
          }
        }

        // Fetch all paginated messages
        let allResults: any[] = [];
        let chatIdValue: string | null = null;
        let nextUrl: string | null = url;
        while (nextUrl) {
          const response = await fetch(nextUrl, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!response.ok) throw new Error('Failed to fetch chat messages');
          const data: any = await response.json();
          if (!chatIdValue && data.results && data.results.length > 0) {
            chatIdValue = data.results[0].chat;
          }
          if (data.results && data.results.length > 0) {
            allResults = allResults.concat(data.results);
          }
          nextUrl = data.next || null;
        }

        if (allResults.length > 0) {
          setChatId(chatIdValue);
          // Map backend messages to ChatMessage format
          const mappedMessages = allResults.map((msg: any) => ({
            id: String(msg.id),
            senderId: String(msg.sender),
            senderName: msg.sender_name || '',
            senderRole: (userRole === 'admin'
              ? (msg.sender === selectedStudent?.id ? 'student' : 'admin')
              : (msg.sender === user?.id ? 'student' : 'admin')) as 'student' | 'admin',
            senderAvatar: msg.sender_avatar || '',
            content: msg.content,
            type: (msg.type || 'text') as 'text' | 'image' | 'file' | 'system',
            attachments: msg.attachments || [],
            timestamp: msg.createdAt || msg.timestamp,
            status: (msg.isRead ? 'read' : 'delivered') as 'sending' | 'sent' | 'delivered' | 'read',
            replyTo: msg.replyTo || null
          }));
          setMessages(mappedMessages);
        } else {
          setChatId(null);
          setMessages([]);
        }
      } catch (err) {
        setChatId(null);
      }
    };
    if ((userRole === 'admin' && selectedStudent) || userRole === 'student') {
      fetchChatId();
    }
  }, [userRole, selectedStudent]);

  // Connect to WebSocket when chatId changes
  useEffect(() => {
    // WebSocket connection with heartbeat and auto-reconnect
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    function connectWebSocket() {
      if (!chatId) return;
      setSocketWarning(null);
      const wsUrl = `ws://localhost:8000/ws/chat/${chatId}/`;
      const token = localStorage.getItem('gradhelper_token');
      const ws = new WebSocket(token ? `${wsUrl}?token=${token}` : wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsOnline(true);
        setSocketWarning(null);
        reconnectAttempts = 0;
        // Heartbeat: send ping every 20s
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.debug('[WebSocket] Received:', data);
          if (data.type === 'pong') {
            // Heartbeat response
            return;
          }
          if (data.type === 'chat.message') {
            // Map incoming WebSocket message to ChatMessage structure
            const msg = data.message;
            const mappedMsg = {
              id: String(msg.id),
              senderId: String(msg.sender),
              senderName: msg.sender_name || '',
              senderRole: (userRole === 'admin'
                ? (msg.sender === selectedStudent?.id ? 'student' : 'admin')
                : (msg.sender === user?.id ? 'student' : 'admin')) as 'student' | 'admin',
              senderAvatar: msg.sender_avatar || '',
              content: msg.content,
              type: msg.type || 'text',
              attachments: msg.attachments || [],
              timestamp: msg.createdAt || msg.timestamp,
              status: (msg.isRead ? 'read' : 'delivered') as 'sending' | 'sent' | 'delivered' | 'read',
              replyTo: msg.replyTo || null
            };
            setMessages((prev) => [...prev, mappedMsg]);
          }
          if (data.type === 'chat.typing') {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 1000);
          }
          if (data.type === 'user.online') {
            setIsOnline(true);
          }
          if (data.type === 'user.offline') {
            setIsOnline(false);
          }
        } catch (err) {
          console.error('[WebSocket] Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        setIsOnline(false);
        setSocketWarning('Chat connection lost. Trying to reconnect...');
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectRef.current = setTimeout(connectWebSocket, reconnectDelay);
        } else {
          setSocketWarning('Unable to reconnect to chat. Please refresh the page.');
        }
      };

      ws.onerror = () => {
        setIsOnline(false);
        setSocketWarning('Chat connection error. Trying to reconnect...');
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectRef.current = setTimeout(connectWebSocket, reconnectDelay);
        } else {
          setSocketWarning('Unable to reconnect to chat. Please refresh the page.');
        }
      };
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [chatId, userRole, selectedStudent]);
  // ...existing code...

  // Initialize students data for admin view
  useEffect(() => {
    if (userRole === 'admin') {
      const fetchStudents = async () => {
        try {
          const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
          const token = localStorage.getItem('gradhelper_token');
          const response = await fetch(`${baseUrl}/api/auth/admin/user-profiles`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
          const data = await response.json();
          // Map API response to Student type
          const studentsData: Student[] = data.map((item: any) => ({
            id: String(item.user_id),
            name: item.first_name + ' ' + item.last_name,
            email: item.email,
            avatar: '',
            subject: item.major || '',
            isOnline: item.is_online,
            unreadCount: 0
          }));
          setStudents(studentsData);
          setSelectedStudent(studentsData[0] || null);
        } catch (error) {
          toast.error('Failed to fetch students');
        }
      };
      fetchStudents();
    }
  }, [userRole]);

  // Load chat messages from localStorage
  useEffect(() => {
    const storageKey = userRole === 'admin' 
      ? `gradhelper_chat_messages_${selectedStudent?.id || 'default'}`
      : 'gradhelper_chat_messages';
      
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initialize with default chat messages
      const defaultMessages = createDefaultChatMessages();
      setMessages(defaultMessages);
      localStorage.setItem(storageKey, JSON.stringify(defaultMessages));
    }
  }, [selectedStudent]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    
    if (newMessage.length > 0) {
      setIsTyping(true);
      typingTimer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
    
    return () => clearTimeout(typingTimer);
  }, [newMessage]);

  const createDefaultChatMessages = (): ChatMessage[] => {
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    
    // Create conversation-specific messages for admin view
    if (userRole === 'admin' && selectedStudent) {
      return [
        {
          id: '1',
          senderId: 'system',
          senderName: 'System',
          senderRole: 'admin',
          content: `Chat session with ${selectedStudent.name} started.`,
          type: 'system',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'delivered'
        },
        {
          id: '2',
          senderId: selectedStudent.id,
          senderName: selectedStudent.name,
          senderRole: 'student',
          senderAvatar: '',
          content: `Hello! I'm working on my ${selectedStudent.subject} project and could use some guidance.`,
          type: 'text',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          status: 'read'
        },
        {
          id: '3',
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: 'admin',
          senderAvatar: '',
          content: `Hi ${selectedStudent.name}! I'd be happy to help with your ${selectedStudent.subject} project. What specific area do you need assistance with?`,
          type: 'text',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          status: 'read'
        }
      ];
    }
    
    return [
      {
        id: '1',
        senderId: 'system',
        senderName: 'System',
        senderRole: 'admin',
        content: 'Chat session started. You are now connected with admin support.',
        type: 'system',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'delivered'
      },
      {
        id: '2',
        senderId: userRole === 'student' ? 'admin-1' : 'student-1',
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : 'Emily Davis',
        senderRole: userRole === 'student' ? 'admin' : 'student',
        senderAvatar: '',
        content: userRole === 'student' 
          ? 'Hello! Welcome to TheGradHelper support. How can I assist you today?'
          : 'Hi! I need some help with my machine learning project. Are you available?',
        type: 'text',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        status: 'read'
      },
      {
        id: '3',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'Hi! I have some questions about my ML project deliverables. Could you help me understand the requirements better?'
          : 'Of course! I would be happy to help with your machine learning project. What specific aspect would you like to discuss?',
        type: 'text',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        status: 'read'
      },
      {
        id: '4',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'Absolutely! I would be happy to help. Can you tell me which specific area you are working on? Is it data preprocessing, model selection, or something else?'
          : 'I am working on a classification problem but I am having trouble with feature selection. Could you guide me on the best approaches?',
        type: 'text',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        status: 'read'
      },
      {
        id: '5',
        senderId: userRole === 'student' ? currentUserId : 'admin-1',
        senderName: userRole === 'student' ? currentUserName : 'Dr. Sarah Wilson',
        senderRole: userRole === 'student' ? userRole : 'admin',
        senderAvatar: '',
        content: userRole === 'student'
          ? 'I am mainly struggling with feature selection and model evaluation. I have tried a few approaches but I am not getting the accuracy I expected.'
          : 'Great question! Feature selection is crucial for classification tasks. I recommend starting with correlation analysis and then trying techniques like Recursive Feature Elimination (RFE) or L1 regularization.',
        type: 'text',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        status: 'read'
      },
      {
        id: '6',
        senderId: userRole === 'student' ? 'admin-1' : currentUserId,
        senderName: userRole === 'student' ? 'Dr. Sarah Wilson' : currentUserName,
        senderRole: userRole === 'student' ? 'admin' : userRole,
        senderAvatar: '',
        content: userRole === 'student'
          ? 'That sounds great! Could you help me understand how to implement RFE properly? I have read about it but I am not sure about the practical implementation.'
          : 'I can definitely help with RFE implementation. Would you like me to share some code examples? Also, what is your dataset size and the number of features you are working with?',
        type: 'text',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'delivered'
      }
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically add message to UI
    const currentUserId = user?.id || 'current-user';
    const currentUserName = user?.name || 'Current User';
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole || 'student',
      senderAvatar: '',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Send message through WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      let recipientId;
      if (userRole === 'admin' && selectedStudent) {
        recipientId = selectedStudent.id;
      } else if (userRole === 'student') {
        recipientId = 1;
      }
      const socketMsg = {
        type: 'chat.message',
        content: newMessage.trim(),
        recipient_id: recipientId,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: userRole || 'student',
        timestamp: message.timestamp
      };
      console.debug('[WebSocket] Sending message:', socketMsg);
      wsRef.current.send(JSON.stringify(socketMsg));
      toast.success('Message sent!');
    } else {
      toast.error('Chat connection is not active. Please wait or refresh.');
    }
  };

  const getAutoResponse = (userMessage: string): string => {
    const responses = [
      "Thank you for your message! I'll help you with that right away.",
      "That's a great question! Let me provide you with some detailed guidance.",
      "I understand your concern. Here's what I recommend...",
      "Perfect! I can definitely help you with this. Let me explain the best approach.",
      "Thanks for reaching out! I'll make sure to address all your questions thoroughly."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return Circle;
      case 'sent': return Check;
      case 'delivered': return CheckCircle;
      case 'read': return CheckCircle;
      default: return Circle;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleSelectStudent = (student: Student) => {
    if (selectedStudent?.id === student.id) return; // Don't reload if same student
    
    setSelectedStudent(student);
    // Mark messages as read
    const updatedStudents = students.map(s => 
      s.id === student.id ? { ...s, unreadCount: 0 } : s
    );
    setStudents(updatedStudents);
    
    // Clear typing indicator when switching students
    setIsTyping(false);
    setNewMessage('');
    
    toast.success(`Switched to conversation with ${student.name}`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentParticipant = userRole === 'student' 
    ? { name: 'The Grad Helper', role: 'Admin' }
    : { 
        name: selectedStudent?.name || 'Select a student', 
        role: selectedStudent?.subject || 'Student'
      };

  return (
    <div className="chat-view">
      {socketWarning && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center text-sm">
          {socketWarning}
        </div>
      )}
      <div className="flex h-[calc(100vh-12rem)] gap-6">
        {/* Student Sidebar - Admin Only */}
        {userRole === 'admin' && (
          <Card className="w-[340px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Students</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`student-item p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <Avatar name={student.name} size="lg" />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            student.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate flex-1">{student.name}</h4>
                            {student.unreadCount > 0 && (
                              <div className="flex-shrink-0 ml-2">
                                <Badge variant="default" className="bg-blue-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                                  {student.unreadCount}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{student.subject}</p>
                          {student.lastMessage && (
                            <p className="text-xs text-gray-500 truncate mt-1">{student.lastMessage}</p>
                          )}
                          {student.lastMessageTime && (
                            <p className="text-xs text-gray-400 mt-1">{student.lastMessageTime}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Main Chat Area */}
         <Card className={`chat-container flex flex-col ${userRole === 'admin' ? 'w-[calc(80vw-460px)]' : 'w-full'}`}>
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b">
            {userRole === 'admin' && !selectedStudent ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">Select a student to start chatting</h3>
                  <p className="text-sm text-gray-500">Choose a student from the sidebar to begin the conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="avatar w-10 h-10">
                        <Avatar name={currentParticipant.name} size="lg" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        (userRole === 'admin' ? selectedStudent?.isOnline : isOnline) ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <CardTitle className="text-base">{currentParticipant.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {currentParticipant.role}
                        {(userRole === 'admin' ? selectedStudent?.isOnline : isOnline) ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-500">Last seen {lastSeen}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardHeader>
          
          {/* Messages Area */}
          {userRole === 'admin' && !selectedStudent ? null : (
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            // Fix alignment: sender messages on right, receiver on left
            // Fix alignment for both student and admin views
            let isCurrentUser: boolean;
            if (userRole === 'student') {
              isCurrentUser = message.senderId === String(user?.id);
            } else if (userRole === 'admin') {
              isCurrentUser = message.senderId !== String(selectedStudent?.id);
            } else {
              isCurrentUser = false;
            }
            const isSystemMessage = message.type === 'system';
            const StatusIcon = getStatusIcon(message.status);
            const showAvatar = !isCurrentUser && !isSystemMessage && 
              (index === 0 || messages[index - 1].senderId !== message.senderId);
            
            if (isSystemMessage) {
              return (
                <div key={message.id} className="system-message text-center py-2">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                    <Info className="w-3 h-3" />
                    {message.content}
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={message.id}
                className={`chat-message flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <div className="avatar-container">
                  {showAvatar ? (
                    <div className="avatar w-8 h-8">
                      <Avatar name={message.senderName} size="md" />
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
                
                <div className={`message-bubble-container max-w-xs lg:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && !isCurrentUser && (
                    <span className="text-xs text-gray-500 mb-1 px-3">
                      {message.senderName}
                    </span>
                  )}
                  
                  <div className={`message-bubble ${
                    isCurrentUser 
                      ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' 
                      : 'bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl'
                  } p-3 shadow-sm`}>
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="attachments mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div 
                            key={attachment.id}
                            className={`attachment flex items-center gap-2 p-2 rounded ${
                              isCurrentUser ? 'bg-blue-700' : 'bg-gray-200'
                            }`}
                          >
                            <File className="w-4 h-4" />
                            <span className="text-xs font-medium truncate flex-1">
                              {attachment.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {isCurrentUser && (
                        <StatusIcon className={`w-3 h-3 ${
                          message.status === 'read' ? 'text-blue-200' : 'text-blue-300'
                        }`} />
                      )}
                    </div>
                    
                    {message.isEdited && (
                      <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        (edited)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
              {/* Typing Indicator */}
              {isTyping && (
                <div className="typing-indicator flex gap-3">
                  <div className="avatar w-8 h-8">
                    <Avatar name={currentParticipant.name} size="md" />
                  </div>
                  <div className="typing-bubble bg-gray-100 rounded-r-2xl rounded-tl-2xl p-3">
                    <div className="typing-dots flex gap-1">
                      <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>
          )}
          
          {/* Chat Input */}
          {userRole === 'admin' && !selectedStudent ? null : (
            <div className="chat-input border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Image className="w-4 h-4" />
            </Button>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="sm">
              <Smile className="w-4 h-4" />
            </Button>
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>
                  {userRole === 'student' ? 'Admin Support' : selectedStudent?.name || 'Student'} is {(userRole === 'admin' ? selectedStudent?.isOnline : isOnline) ? 'online' : `last seen ${lastSeen}`}
                </span>
                {isTyping && (
                  <span className="text-blue-600">
                    {currentParticipant.name} is typing...
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}