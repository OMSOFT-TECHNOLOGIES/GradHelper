import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Upload, X, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

export function PostTask() {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    deadline: undefined as Date | undefined,
    budget: '',
    requirements: '',
    subject: '',
    academicLevel: '',
    pages: '',
    citations: ''
  });

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>(['']);

  const taskTypes = [
    'Assignment',
    'Essay',
    'Research Paper',
    'Final Year Project',
    'Case Study',
    'Presentation',
    'Lab Report',
    'Thesis',
    'Dissertation',
    'Other'
  ];

  const academicLevels = [
    'High School',
    'Undergraduate',
    'Graduate',
    'Masters',
    'PhD',
    'Professional'
  ];

  const subjects = [
    'Computer Science',
    'Engineering',
    'Business',
    'Mathematics',
    'Science',
    'Literature',
    'History',
    'Psychology',
    'Medicine',
    'Law',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.type || !formData.description || !formData.deadline) {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields marked with *'
      });
      return;
    }

    // Show loading toast
    toast.loading('Submitting your task...', { id: 'task-submit' });

    // Mock submission with delay
    setTimeout(() => {
      toast.success('Task posted successfully!', {
        id: 'task-submit',
        description: 'You will receive a confirmation email shortly. Our experts will review your task and contact you soon.'
      });

      // Reset form
      setFormData({
        title: '',
        type: '',
        description: '',
        deadline: undefined,
        budget: '',
        requirements: '',
        subject: '',
        academicLevel: '',
        pages: '',
        citations: ''
      });
      setAttachedFiles([]);
      setDeliverables(['']);
    }, 1500);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const mockFileUpload = () => {
    const fileName = `document_${Date.now()}.pdf`;
    setAttachedFiles([...attachedFiles, fileName]);
    toast.success('File uploaded successfully!', {
      description: `${fileName} has been attached to your task.`
    });
  };

  const handleSaveDraft = () => {
    toast.info('Draft saved', {
      description: 'Your task has been saved as a draft. You can continue editing later.'
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post New Task</CardTitle>
          <CardDescription>
            Submit your assignment or project details for expert assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Machine Learning Research Paper"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your task, including specific requirements, topics to cover, and any special instructions..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Academic Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicLevel">Academic Level</Label>
                <Select value={formData.academicLevel} onValueChange={(value) => setFormData({...formData, academicLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Number of Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.pages}
                  onChange={(e) => setFormData({...formData, pages: e.target.value})}
                />
              </div>
            </div>

            {/* Deadline and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => setFormData({...formData, deadline: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input
                  id="budget"
                  placeholder="e.g., $100-200"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific formatting requirements, citation styles (APA, MLA, Chicago, etc.), software to use, etc."
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
            </div>

            {/* Deliverables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Expected Deliverables</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
              <div className="space-y-2">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Deliverable ${index + 1} (e.g., Draft version, Final document, Presentation slides)`}
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                    />
                    {deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* File Attachments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Attachments</Label>
                <Button type="button" variant="outline" size="sm" onClick={mockFileUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Citations */}
            <div className="space-y-2">
              <Label htmlFor="citations">Citations & References</Label>
              <Input
                id="citations"
                placeholder="e.g., Minimum 10 academic sources, APA style"
                value={formData.citations}
                onChange={(e) => setFormData({...formData, citations: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Submit Task
              </Button>
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Tips for posting effective tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Writing Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific about your requirements</li>
                <li>• Include all relevant course materials</li>
                <li>• Mention any preferred sources or references</li>
                <li>• Specify formatting requirements (APA, MLA, etc.)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Timeline Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Allow adequate time for revisions</li>
                <li>• Consider complexity when setting deadlines</li>
                <li>• Rush orders may incur additional fees</li>
                <li>• Plan for feedback and review cycles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}