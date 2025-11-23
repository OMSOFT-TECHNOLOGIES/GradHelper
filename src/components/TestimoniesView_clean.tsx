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
  Plus, 
  Star, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  X,
  MessageCircle,
  User,
  Calendar,
  Eye,
  ThumbsUp,
  Filter,
  Search,
  GraduationCap,
  Award,
  FileText,
  Quote,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';
import { toast } from "sonner";

interface Testimony {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  studentUniversity?: string;
  studentProgram?: string;
  title: string;
  content: string;
  rating: number;
  serviceType: 'final_year_project' | 'assignment' | 'thesis' | 'research_paper' | 'consultation' | 'other';
  projectTitle?: string;
  completionDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  likes: number;
  views: number;
}

interface TestimoniesViewProps {
  userRole?: 'student' | 'admin';
  user?: any;
}

const SERVICE_TYPES = [
  { value: 'final_year_project', label: 'Final Year Project', icon: GraduationCap },
  { value: 'assignment', label: 'Assignment', icon: FileText },
  { value: 'thesis', label: 'Thesis/Dissertation', icon: Award },
  { value: 'research_paper', label: 'Research Paper', icon: FileText },
  { value: 'consultation', label: 'Consultation', icon: MessageCircle },
  { value: 'other', label: 'Other', icon: User }
];

export function TestimoniesView({ userRole = 'student', user }: TestimoniesViewProps) {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'featured'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    serviceType: 'final_year_project' as Testimony['serviceType'],
    projectTitle: '',
    studentUniversity: '',
    studentProgram: '',
    isPublic: true
  });

  // Load testimonies from localStorage
  useEffect(() => {
    const savedTestimonies = localStorage.getItem('gradhelper_testimonies');
    if (savedTestimonies) {
      setTestimonies(JSON.parse(savedTestimonies));
    } else {
      // Add default testimonies for demo
      const defaultTestimonies: Testimony[] = [
        {
          id: '1',
          studentId: 'student1',
          studentName: 'Sarah Johnson',
          studentEmail: 'sarah.j@university.edu',
          studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
          studentUniversity: 'MIT',
          studentProgram: 'Computer Science',
          title: 'Exceptional Support for My Final Year Project',
          content: 'TheGradHelper completely transformed my final year project experience. The expert guidance was incredible, and I achieved the highest grade in my class! The team was professional, responsive, and truly understood my requirements.',
          rating: 5,
          serviceType: 'final_year_project',
          projectTitle: 'Machine Learning for Healthcare Diagnostics',
          completionDate: '2024-12-15',
          status: 'featured',
          isPublic: true,
          createdAt: '2024-12-20T10:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z',
          likes: 24,
          views: 156
        },
        {
          id: '2',
          studentId: 'student2',
          studentName: 'Mike Wilson',
          studentEmail: 'mike.w@business.edu',
          studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
          studentUniversity: 'Harvard Business School',
          studentProgram: 'MBA',
          title: 'Outstanding MBA Dissertation Support',
          content: 'I was struggling with my MBA dissertation until I found TheGradHelper. The quality of research and writing support was outstanding. They helped me structure my arguments and provided valuable insights.',
          rating: 5,
          serviceType: 'thesis',
          projectTitle: 'Digital Transformation in Traditional Industries',
          completionDate: '2024-11-30',
          status: 'approved',
          isPublic: true,
          createdAt: '2024-12-18T14:30:00Z',
          updatedAt: '2024-12-18T14:30:00Z',
          likes: 18,
          views: 89
        },
        {
          id: '3',
          studentId: 'student3',
          studentName: 'Emily Davis',
          studentEmail: 'emily.d@stanford.edu',
          studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
          studentUniversity: 'Stanford University',
          studentProgram: 'Psychology PhD',
          title: 'Expert Statistical Analysis Help',
          content: 'As a PhD student, I needed specialized help with statistical analysis. TheGradHelper connected me with the perfect expert. Professional and reliable service that exceeded my expectations.',
          rating: 4,
          serviceType: 'research_paper',
          projectTitle: 'Cognitive Behavioral Patterns in Social Media Usage',
          completionDate: '2024-12-10',
          status: 'approved',
          isPublic: true,
          createdAt: '2024-12-22T09:15:00Z',
          updatedAt: '2024-12-22T09:15:00Z',
          likes: 12,
          views: 45
        }
      ];
      setTestimonies(defaultTestimonies);
      localStorage.setItem('gradhelper_testimonies', JSON.stringify(defaultTestimonies));
    }
  }, []);

  // Save testimonies to localStorage
  const saveTestimonies = (newTestimonies: Testimony[]) => {
    setTestimonies(newTestimonies);
    localStorage.setItem('gradhelper_testimonies', JSON.stringify(newTestimonies));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    const testimony: Testimony = {
      id: editingTestimony?.id || Date.now().toString(),
      studentId: user.id || 'current-user',
      studentName: user.name || 'Anonymous',
      studentEmail: user.email || '',
      studentAvatar: user.avatar,
      studentUniversity: formData.studentUniversity,
      studentProgram: formData.studentProgram,
      title: formData.title,
      content: formData.content,
      rating: formData.rating,
      serviceType: formData.serviceType,
      projectTitle: formData.projectTitle,
      completionDate: new Date().toISOString().split('T')[0],
      status: editingTestimony?.status || 'pending',
      isPublic: formData.isPublic,
      createdAt: editingTestimony?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: editingTestimony?.adminNotes,
      likes: editingTestimony?.likes || 0,
      views: editingTestimony?.views || 0
    };

    let newTestimonies;
    if (editingTestimony) {
      newTestimonies = testimonies.map(t => 
        t.id === editingTestimony.id ? testimony : t
      );
      toast.success('Testimony updated successfully!');
    } else {
      newTestimonies = [testimony, ...testimonies];
      toast.success('Testimony submitted successfully!', {
        description: 'Your testimony is pending review and will be published once approved.'
      });
    }

    saveTestimonies(newTestimonies);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      rating: 5,
      serviceType: 'final_year_project',
      projectTitle: '',
      studentUniversity: '',
      studentProgram: '',
      isPublic: true
    });
    setEditingTestimony(null);
  };

  const handleEdit = (testimony: Testimony) => {
    setEditingTestimony(testimony);
    setFormData({
      title: testimony.title,
      content: testimony.content,
      rating: testimony.rating,
      serviceType: testimony.serviceType,
      projectTitle: testimony.projectTitle || '',
      studentUniversity: testimony.studentUniversity || '',
      studentProgram: testimony.studentProgram || '',
      isPublic: testimony.isPublic
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const newTestimonies = testimonies.filter(t => t.id !== id);
    saveTestimonies(newTestimonies);
    toast.success('Testimony deleted successfully!');
  };

  const handleStatusChange = (id: string, status: Testimony['status']) => {
    const newTestimonies = testimonies.map(t =>
      t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    saveTestimonies(newTestimonies);
    
    const statusMessages = {
      approved: 'Testimony approved and published!',
      rejected: 'Testimony rejected',
      featured: 'Testimony featured on landing page!',
      pending: 'Testimony status set to pending'
    };
    
    toast.success(statusMessages[status]);
  };

  const getServiceTypeInfo = (serviceType: string) => {
    return SERVICE_TYPES.find(s => s.value === serviceType) || SERVICE_TYPES[0];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      featured: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: X,
      featured: Star
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  // Filter testimonies based on role, filter, and search
  const filteredTestimonies = testimonies.filter(testimony => {
    // Role-based filtering
    if (userRole === 'student' && testimony.studentId !== user?.id) {
      return false;
    }
    
    // Status filtering
    if (filter !== 'all' && testimony.status !== filter) {
      return false;
    }
    
    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        testimony.title.toLowerCase().includes(searchLower) ||
        testimony.content.toLowerCase().includes(searchLower) ||
        testimony.studentName.toLowerCase().includes(searchLower) ||
        testimony.projectTitle?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Statistics for admin view
  const stats = {
    total: testimonies.length,
    pending: testimonies.filter(t => t.status === 'pending').length,
    approved: testimonies.filter(t => t.status === 'approved').length,
    featured: testimonies.filter(t => t.status === 'featured').length,
    rejected: testimonies.filter(t => t.status === 'rejected').length,
    averageRating: testimonies.reduce((sum, t) => sum + t.rating, 0) / (testimonies.length || 1)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Professional Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Quote className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-800 bg-clip-text text-transparent">
                    {userRole === 'admin' ? 'Student Success Stories' : 'My Success Journey'}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium mt-2">
                    {userRole === 'admin' 
                      ? 'Showcase academic achievements and build trust'
                      : 'Share your academic success and inspire others'
                    }
                  </p>
                </div>
              </div>
              <p className="text-gray-600 max-w-3xl leading-relaxed text-lg">
                {userRole === 'admin' 
                  ? 'Manage and feature student testimonials to demonstrate the impact of your academic support services. Review submissions, approve content, and showcase success stories that inspire future students.'
                  : 'Your academic journey matters. Share your experience with TheGradHelper to help fellow students discover the support they need to achieve their goals. Every success story inspires others to reach for excellence.'
                }
              </p>
            </div>
            
            {userRole === 'student' && (
              <div className="flex-shrink-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={resetForm}
                      size="lg"
                      className="group bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-0"
                    >
                      <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-lg">Share Your Success Story</span>
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
                    <DialogHeader className="pb-6">
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        {editingTestimony ? 'Edit Your Success Story' : 'Share Your Success Story'}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 text-lg">
                        Help other students by sharing your experience with TheGradHelper. Your story could be the inspiration someone needs to achieve their academic goals.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Excellent support for my final year project"
                            className="mt-2 h-12 text-lg"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-700">Service Type</Label>
                          <Select 
                            value={formData.serviceType} 
                            onValueChange={(value: Testimony['serviceType']) => 
                              setFormData({ ...formData, serviceType: value })
                            }
                          >
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SERVICE_TYPES.map((service) => (
                                <SelectItem key={service.value} value={service.value}>
                                  <div className="flex items-center gap-3">
                                    <service.icon className="w-5 h-5" />
                                    {service.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="rating" className="text-sm font-semibold text-gray-700">Rating</Label>
                          <Select 
                            value={formData.rating.toString()} 
                            onValueChange={(value) => 
                              setFormData({ ...formData, rating: parseInt(value) })
                            }
                          >
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center gap-3">
                                    <div className="flex">
                                      {[...Array(rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                                      ))}
                                    </div>
                                    <span className="font-medium">{rating} Star{rating !== 1 ? 's' : ''}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="projectTitle" className="text-sm font-semibold text-gray-700">Project/Assignment Title</Label>
                          <Input
                            id="projectTitle"
                            value={formData.projectTitle}
                            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                            placeholder="e.g., Machine Learning Classification System"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="studentUniversity" className="text-sm font-semibold text-gray-700">University</Label>
                          <Input
                            id="studentUniversity"
                            value={formData.studentUniversity}
                            onChange={(e) => setFormData({ ...formData, studentUniversity: e.target.value })}
                            placeholder="e.g., MIT, Stanford University"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="studentProgram" className="text-sm font-semibold text-gray-700">Program/Degree</Label>
                          <Input
                            id="studentProgram"
                            value={formData.studentProgram}
                            onChange={(e) => setFormData({ ...formData, studentProgram: e.target.value })}
                            placeholder="e.g., Computer Science, MBA"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div className="lg:col-span-2">
                          <Label htmlFor="content" className="text-sm font-semibold text-gray-700">Your Experience *</Label>
                          <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Share details about your experience with TheGradHelper. What did you like? How did we help you achieve your goals?"
                            rows={6}
                            className="mt-2 text-lg"
                            required
                          />
                        </div>
                        
                        <div className="lg:col-span-2">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={formData.isPublic}
                              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                              className="w-5 h-5 rounded border-2"
                            />
                            <span className="text-sm text-gray-700">
                              I agree to make my testimony public (it will be reviewed before publishing)
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          className="px-6 py-2"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-2"
                        >
                          {editingTestimony ? 'Update' : 'Submit'} Story
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Stats Dashboard for Admin */}
      {userRole === 'admin' && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 font-bold text-sm uppercase tracking-wider">Total Stories</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                      <div className="flex items-center mt-2 text-blue-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Growing</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-700 font-bold text-sm uppercase tracking-wider">Pending Review</p>
                      <p className="text-3xl font-bold text-amber-900 mt-2">{stats.pending}</p>
                      <div className="flex items-center mt-2 text-amber-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Awaiting</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 font-bold text-sm uppercase tracking-wider">Approved</p>
                      <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.approved}</p>
                      <div className="flex items-center mt-2 text-emerald-600">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Published</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 font-bold text-sm uppercase tracking-wider">Featured</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">{stats.featured}</p>
                      <div className="flex items-center mt-2 text-purple-600">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Spotlight</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-7 h-7 text-white fill-current" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 col-span-2 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-700 font-bold text-sm uppercase tracking-wider">Avg Rating</p>
                      <p className="text-3xl font-bold text-orange-900 mt-2">{stats.averageRating.toFixed(1)}</p>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(stats.averageRating) ? 'text-orange-500 fill-current' : 'text-orange-200'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Star className="w-7 h-7 text-white fill-current" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Enhanced Filters and Search */}
        <Card className="mb-10 border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Filter & Search</h3>
                    <p className="text-sm text-gray-600">Find specific testimonials quickly</p>
                  </div>
                </div>
                
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-56 h-12 bg-white border-2 border-gray-200 rounded-xl font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🏆 All Testimonials</SelectItem>
                    {userRole === 'admin' && (
                      <>
                        <SelectItem value="pending">⏳ Pending Review</SelectItem>
                        <SelectItem value="approved">✅ Approved</SelectItem>
                        <SelectItem value="rejected">❌ Rejected</SelectItem>
                        <SelectItem value="featured">⭐ Featured</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-full xl:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, title, project, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white border-2 border-gray-200 rounded-xl text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonies List */}
        <div className="testimonies-list">
          {filteredTestimonies.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-3xl overflow-hidden">
              <CardContent className="p-16 text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-100 via-purple-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <MessageCircle className="w-16 h-16 text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  {userRole === 'student' ? 'Your Success Story Awaits' : 'No Testimonials Found'}
                </h3>
                <p className="text-gray-600 mb-10 max-w-lg mx-auto text-xl leading-relaxed">
                  {userRole === 'student' 
                    ? 'Join hundreds of students who have shared their academic success stories. Your journey could inspire others to achieve their goals and reach new heights.'
                    : 'No testimonials match your current search criteria. Try adjusting your filters or search terms to find what you\'re looking for.'
                  }
                </p>
                {userRole === 'student' && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Share Your Success Story
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8">
              {filteredTestimonies.map((testimony) => {
                const ServiceIcon = getServiceTypeInfo(testimony.serviceType).icon;
                const StatusIcon = getStatusIcon(testimony.status);
                
                return (
                  <Card key={testimony.id} className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                    {/* Featured Badge */}
                    {testimony.status === 'featured' && (
                      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-6 py-4">
                        <div className="flex items-center gap-3 text-white font-bold text-lg">
                          <Star className="w-6 h-6 fill-current" />
                          🌟 Featured Success Story
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-6 px-8 pt-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-6 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl">
                              <img 
                                src={testimony.studentAvatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face`} 
                                alt={testimony.studentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Service Type Badge */}
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                              <ServiceIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                              <h4 className="font-bold text-gray-900 text-2xl">{testimony.studentName}</h4>
                              <Badge className={`${getStatusColor(testimony.status)} flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border`}>
                                <StatusIcon className="w-4 h-4" />
                                {testimony.status.charAt(0).toUpperCase() + testimony.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-sm font-bold text-blue-700 border border-blue-200">
                                  <ServiceIcon className="w-5 h-5" />
                                  {getServiceTypeInfo(testimony.serviceType).label}
                                </div>
                              </div>
                              
                              {testimony.studentUniversity && (
                                <div className="flex items-center gap-3 text-lg text-gray-700">
                                  <GraduationCap className="w-5 h-5 text-blue-600" />
                                  <span className="font-bold">{testimony.studentUniversity}</span>
                                  {testimony.studentProgram && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span className="font-medium">{testimony.studentProgram}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* Enhanced Rating Display */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-6 h-6 ${
                                      i < testimony.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-200'
                                    }`} />
                                  ))}
                                </div>
                                <span className="text-lg font-bold text-gray-800">
                                  {testimony.rating}.0 out of 5
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          {userRole === 'admin' && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(testimony.id, 'approved')}
                                className="h-10 w-10 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                disabled={testimony.status === 'approved'}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(testimony.id, 'featured')}
                                className="h-10 w-10 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl"
                              >
                                <Star className={`w-5 h-5 ${testimony.status === 'featured' ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(testimony.id, 'rejected')}
                                className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                          )}
                          
                          {userRole === 'student' && testimony.studentId === user?.id && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(testimony)}
                                className="h-10 w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                              >
                                <Edit className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(testimony.id)}
                                className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-8">
                      {/* Project Title Banner */}
                      {testimony.projectTitle && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-l-4 border-blue-500 shadow-sm">
                          <div className="flex items-center gap-3 text-blue-700 mb-2">
                            <FileText className="w-6 h-6" />
                            <span className="font-bold text-sm uppercase tracking-wider">Project</span>
                          </div>
                          <p className="font-bold text-blue-900 text-xl">{testimony.projectTitle}</p>
                        </div>
                      )}
                      
                      {/* Testimony Title */}
                      <h5 className="font-bold text-2xl text-gray-900 mb-6 leading-tight">
                        {testimony.title}
                      </h5>
                      
                      {/* Testimony Content */}
                      <div className="relative mb-8">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 rounded-full"></div>
                        <blockquote className="pl-8 text-gray-700 text-xl leading-relaxed font-medium italic">
                          "{testimony.content}"
                        </blockquote>
                      </div>
                      
                      {/* Footer with metadata */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-medium">
                            <Calendar className="w-4 h-4" />
                            {new Date(testimony.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          
                          {userRole === 'admin' && (
                            <>
                              <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                                <Eye className="w-4 h-4" />
                                {testimony.views} views
                              </span>
                              <span className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-medium">
                                <ThumbsUp className="w-4 h-4" />
                                {testimony.likes} likes
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}