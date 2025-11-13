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
  FileText
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
          status: 'pending',
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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      featured: 'bg-blue-100 text-blue-800'
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
    <div className="testimonies-view">
      <div className="testimonies-header">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {userRole === 'admin' ? 'Student Testimonies' : 'My Testimonies'}
            </h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'admin' 
                ? 'Review and manage student feedback and testimonials'
                : 'Share your experience and view your submitted testimonies'
              }
            </p>
          </div>
          
          {userRole === 'student' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Experience
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTestimony ? 'Edit Your Testimony' : 'Share Your Experience'}
                  </DialogTitle>
                  <DialogDescription>
                    Help other students by sharing your experience with TheGradHelper. Your feedback helps us improve our services.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Excellent support for my final year project"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select 
                        value={formData.serviceType} 
                        onValueChange={(value: Testimony['serviceType']) => 
                          setFormData({ ...formData, serviceType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((service) => (
                            <SelectItem key={service.value} value={service.value}>
                              <div className="flex items-center gap-2">
                                <service.icon className="w-4 h-4" />
                                {service.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select 
                        value={formData.rating.toString()} 
                        onValueChange={(value) => 
                          setFormData({ ...formData, rating: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                                  ))}
                                </div>
                                <span>{rating} Star{rating !== 1 ? 's' : ''}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="projectTitle">Project/Assignment Title</Label>
                      <Input
                        id="projectTitle"
                        value={formData.projectTitle}
                        onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                        placeholder="e.g., Machine Learning Classification System"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="studentUniversity">University</Label>
                      <Input
                        id="studentUniversity"
                        value={formData.studentUniversity}
                        onChange={(e) => setFormData({ ...formData, studentUniversity: e.target.value })}
                        placeholder="e.g., MIT, Stanford University"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="studentProgram">Program/Degree</Label>
                      <Input
                        id="studentProgram"
                        value={formData.studentProgram}
                        onChange={(e) => setFormData({ ...formData, studentProgram: e.target.value })}
                        placeholder="e.g., Computer Science, MBA"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="content">Your Experience *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share details about your experience with TheGradHelper. What did you like? How did we help you achieve your goals?"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">
                          I agree to make my testimony public (it will be reviewed before publishing)
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTestimony ? 'Update' : 'Submit'} Testimony
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Overview for Admin */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
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
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xl font-semibold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-xl font-semibold">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Featured</p>
                    <p className="text-xl font-semibold">{stats.featured}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-xl font-semibold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {userRole === 'admin' && (
                  <>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search testimonies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Testimonies List */}
      <div className="testimonies-list">
        {filteredTestimonies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === 'student' ? 'No testimonies yet' : 'No testimonies found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {userRole === 'student' 
                  ? 'Share your experience with TheGradHelper to help other students.'
                  : 'No testimonies match your current filters.'
                }
              </p>
              {userRole === 'student' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Experience
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTestimonies.map((testimony) => {
              const ServiceIcon = getServiceTypeInfo(testimony.serviceType).icon;
              const StatusIcon = getStatusIcon(testimony.status);
              
              return (
                <Card key={testimony.id} className="testimony-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar w-12 h-12">
                          <img 
                            src={testimony.studentAvatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face`} 
                            alt={testimony.studentName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimony.studentName}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ServiceIcon className="w-4 h-4" />
                            {getServiceTypeInfo(testimony.serviceType).label}
                            {testimony.studentUniversity && (
                              <>
                                <span>•</span>
                                <span>{testimony.studentUniversity}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(testimony.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">
                              ({testimony.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(testimony.status)} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {testimony.status.charAt(0).toUpperCase() + testimony.status.slice(1)}
                        </Badge>
                        
                        {userRole === 'admin' && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(testimony.id, 'approved')}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              disabled={testimony.status === 'approved'}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(testimony.id, 'featured')}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            >
                              <Star className={`w-4 h-4 ${testimony.status === 'featured' ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(testimony.id, 'rejected')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        
                        {userRole === 'student' && testimony.studentId === user?.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(testimony)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(testimony.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <h5 className="font-semibold text-gray-900 mb-2">{testimony.title}</h5>
                    {testimony.projectTitle && (
                      <p className="text-sm text-blue-600 mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Project: {testimony.projectTitle}
                      </p>
                    )}
                    <p className="text-gray-700 leading-relaxed mb-4">
                      "{testimony.content}"
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(testimony.createdAt).toLocaleDateString()}
                        </span>
                        {userRole === 'admin' && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {testimony.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {testimony.likes} likes
                            </span>
                          </>
                        )}
                      </div>
                      
                      {testimony.studentProgram && (
                        <span>{testimony.studentProgram}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}