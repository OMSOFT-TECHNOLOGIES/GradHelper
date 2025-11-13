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
  Trophy, 
  Users, 
  Award, 
  Star, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle,
  Target,
  TrendingUp,
  Medal,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { toast } from "sonner";

interface Accomplishment {
  id: string;
  title: string;
  description: string;
  category: 'student_success' | 'milestone' | 'recognition' | 'partnership' | 'innovation' | 'community';
  metric?: string; // e.g., "500+ Students Helped", "98% Success Rate"
  date: string;
  imageUrl?: string;
  isPublished: boolean;
  featured: boolean;
}

const ACCOMPLISHMENT_CATEGORIES = [
  { value: 'student_success', label: 'Student Success', icon: GraduationCap, color: 'bg-green-500' },
  { value: 'milestone', label: 'Company Milestone', icon: Target, color: 'bg-blue-500' },
  { value: 'recognition', label: 'Recognition & Awards', icon: Trophy, color: 'bg-yellow-500' },
  { value: 'partnership', label: 'Partnership', icon: Users, color: 'bg-purple-500' },
  { value: 'innovation', label: 'Innovation', icon: TrendingUp, color: 'bg-indigo-500' },
  { value: 'community', label: 'Community Impact', icon: Medal, color: 'bg-pink-500' }
];

export function AccomplishmentsView() {
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccomplishment, setEditingAccomplishment] = useState<Accomplishment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'student_success' as Accomplishment['category'],
    metric: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    isPublished: true,
    featured: false
  });

  // Load accomplishments from localStorage
  useEffect(() => {
    const savedAccomplishments = localStorage.getItem('gradhelper_accomplishments');
    if (savedAccomplishments) {
      setAccomplishments(JSON.parse(savedAccomplishments));
    } else {
      // Add some default accomplishments
      const defaultAccomplishments: Accomplishment[] = [
        {
          id: '1',
          title: '50,000+ Students Successfully Helped',
          description: 'Reached a major milestone of helping over 50,000 students worldwide achieve their academic goals with expert guidance and support.',
          category: 'student_success',
          metric: '50,000+ Students',
          date: '2024-12-01',
          imageUrl: 'https://images.unsplash.com/photo-1715807987067-56019cfa42a3?w=500&h=300&fit=crop',
          isPublished: true,
          featured: true
        },
        {
          id: '2',
          title: 'Industry Excellence Award 2024',
          description: 'Received the Educational Technology Excellence Award for innovation in online academic support services.',
          category: 'recognition',
          metric: '98% Success Rate',
          date: '2024-11-15',
          imageUrl: 'https://images.unsplash.com/photo-1642104744809-14b986179927?w=500&h=300&fit=crop',
          isPublished: true,
          featured: true
        },
        {
          id: '3',
          title: 'Partnership with 200+ Universities',
          description: 'Established partnerships with over 200 universities globally to provide seamless academic support to their students.',
          category: 'partnership',
          metric: '200+ Universities',
          date: '2024-10-30',
          isPublished: true,
          featured: false
        }
      ];
      setAccomplishments(defaultAccomplishments);
      localStorage.setItem('gradhelper_accomplishments', JSON.stringify(defaultAccomplishments));
    }
  }, []);

  // Save accomplishments to localStorage
  const saveAccomplishments = (newAccomplishments: Accomplishment[]) => {
    setAccomplishments(newAccomplishments);
    localStorage.setItem('gradhelper_accomplishments', JSON.stringify(newAccomplishments));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const accomplishment: Accomplishment = {
      id: editingAccomplishment?.id || Date.now().toString(),
      ...formData
    };

    let newAccomplishments;
    if (editingAccomplishment) {
      newAccomplishments = accomplishments.map(a => 
        a.id === editingAccomplishment.id ? accomplishment : a
      );
      toast.success('Accomplishment updated successfully!');
    } else {
      newAccomplishments = [accomplishment, ...accomplishments];
      toast.success('Accomplishment added successfully!');
    }

    saveAccomplishments(newAccomplishments);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'student_success',
      metric: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: '',
      isPublished: true,
      featured: false
    });
    setEditingAccomplishment(null);
  };

  const handleEdit = (accomplishment: Accomplishment) => {
    setEditingAccomplishment(accomplishment);
    setFormData({
      title: accomplishment.title,
      description: accomplishment.description,
      category: accomplishment.category,
      metric: accomplishment.metric || '',
      date: accomplishment.date,
      imageUrl: accomplishment.imageUrl || '',
      isPublished: accomplishment.isPublished,
      featured: accomplishment.featured
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const newAccomplishments = accomplishments.filter(a => a.id !== id);
    saveAccomplishments(newAccomplishments);
    toast.success('Accomplishment deleted successfully!');
  };

  const togglePublished = (id: string) => {
    const newAccomplishments = accomplishments.map(a =>
      a.id === id ? { ...a, isPublished: !a.isPublished } : a
    );
    saveAccomplishments(newAccomplishments);
    toast.success('Publication status updated!');
  };

  const toggleFeatured = (id: string) => {
    const newAccomplishments = accomplishments.map(a =>
      a.id === id ? { ...a, featured: !a.featured } : a
    );
    saveAccomplishments(newAccomplishments);
    toast.success('Featured status updated!');
  };

  const getCategoryInfo = (category: string) => {
    return ACCOMPLISHMENT_CATEGORIES.find(c => c.value === category) || ACCOMPLISHMENT_CATEGORIES[0];
  };

  const publishedCount = accomplishments.filter(a => a.isPublished).length;
  const featuredCount = accomplishments.filter(a => a.featured).length;

  return (
    <div className="accomplishments-view">
      <div className="accomplishments-header">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Accomplishments</h1>
            <p className="text-gray-600 mt-1">Manage company achievements and milestones</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Accomplishment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAccomplishment ? 'Edit Accomplishment' : 'Add New Accomplishment'}
                </DialogTitle>
                <DialogDescription>
                  Share your company's achievements and milestones with the community.
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
                      placeholder="e.g., 50,000+ Students Helped"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the accomplishment in detail..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: Accomplishment['category']) => 
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMPLISHMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <category.icon className="w-4 h-4" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metric">Key Metric</Label>
                    <Input
                      id="metric"
                      value={formData.metric}
                      onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                      placeholder="e.g., 50,000+ Students, 98% Success Rate"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="col-span-2 flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Featured</span>
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
                    {editingAccomplishment ? 'Update' : 'Add'} Accomplishment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-semibold">{accomplishments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-xl font-semibold">{publishedCount}</p>
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
                  <p className="text-xl font-semibold">{featuredCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-semibold">
                    {accomplishments.filter(a => {
                      const accomplishmentDate = new Date(a.date);
                      const now = new Date();
                      return accomplishmentDate.getMonth() === now.getMonth() && 
                             accomplishmentDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accomplishments List */}
      <div className="accomplishments-list">
        {accomplishments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No accomplishments yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first company achievement or milestone.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Accomplishment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accomplishments.map((accomplishment) => {
              const categoryInfo = getCategoryInfo(accomplishment.category);
              
              return (
                <Card key={accomplishment.id} className="accomplishment-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                          <categoryInfo.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {categoryInfo.label}
                          </Badge>
                          {accomplishment.featured && (
                            <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(accomplishment.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className={`w-4 h-4 ${accomplishment.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(accomplishment)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(accomplishment.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg leading-6">{accomplishment.title}</CardTitle>
                    {accomplishment.metric && (
                      <div className="text-2xl font-bold text-blue-600">{accomplishment.metric}</div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {accomplishment.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img 
                          src={accomplishment.imageUrl} 
                          alt={accomplishment.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    
                    <CardDescription className="text-sm line-clamp-3 mb-3">
                      {accomplishment.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(accomplishment.date).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(accomplishment.id)}
                        className={`h-6 px-2 text-xs ${
                          accomplishment.isPublished 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-600 hover:text-gray-700'
                        }`}
                      >
                        {accomplishment.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </Button>
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