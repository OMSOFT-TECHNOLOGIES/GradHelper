import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Upload, X, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { API_BASE_URL } from '../utils/api';

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

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    'School Project',
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
    'Computer Science And Related Fields',
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Prepare JSON payload - start with minimal required fields first
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline.toISOString(),
        // Only include optional fields if they have values
        ...(formData.type && { type: formData.type }),
        ...(formData.budget && { budget: formData.budget }),
        ...(formData.requirements && { requirements: formData.requirements }),
        ...(formData.subject && { subject: formData.subject }),
        ...(formData.academicLevel && { academic_level: formData.academicLevel }),
        ...(formData.pages && { pages: parseInt(formData.pages) }),
        ...(formData.citations && { citations: formData.citations }),
      };

      // Add deliverables only if they exist and are not empty
      const validDeliverables = deliverables.filter(d => d.trim() !== '');
      if (validDeliverables.length > 0) {
        // Backend expects objects/dictionaries, not strings
        taskData.deliverables = validDeliverables.map((deliverable, index) => ({
          title: deliverable.trim(),
          description: deliverable.trim(),
          order: index + 1,
          completed: false
        }));
      }

      // Log the data being sent for debugging
      console.log('Submitting task data:', taskData);

      // Get auth token from localStorage
      const token = localStorage.getItem('gradhelper_token');
      
      let response;
      
      // Use FormData when files are present, JSON when no files
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        
        // Add all basic form fields
        formData.append('title', taskData.title);
        formData.append('description', taskData.description);
        formData.append('deadline', taskData.deadline);
        
        if (taskData.type) formData.append('type', taskData.type);
        if (taskData.budget) formData.append('budget', taskData.budget);
        if (taskData.requirements) formData.append('requirements', taskData.requirements);
        if (taskData.subject) formData.append('subject', taskData.subject);
        if (taskData.academic_level) formData.append('academic_level', taskData.academic_level);
        if (taskData.pages) formData.append('pages', taskData.pages.toString());
        if (taskData.citations) formData.append('citations', taskData.citations);
        
        // Skip deliverables for now to test if the basic form works
        // TODO: Add deliverables back once we figure out the right format
        
        // Add files - this matches the API expectation from the attachment
        attachedFiles.forEach((file) => {
          formData.append('attachments', file);
        });
        
        response = await fetch(`${API_BASE_URL}/tasks/`, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            // Don't set Content-Type for FormData - browser sets it with boundary
          },
          body: formData,
        });
      } else {
        // No files, use JSON
        response = await fetch(`${API_BASE_URL}/tasks/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify(taskData),
        });
      }

      // Check if response is JSON or HTML
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Server returned HTML (likely an error page)
        const htmlText = await response.text();
        console.error('Server returned HTML instead of JSON:', htmlText);
        result = { 
          error: 'Server error - received HTML response instead of JSON',
          html_content: htmlText.substring(0, 200) + '...' // Show first 200 chars
        };
      }
      
      // Log response for debugging
      console.log('API Response:', response.status, result);

      if (response.ok) {
        toast.success('Task posted successfully!', {
          id: 'task-submit',
          description: 'You will receive a confirmation email shortly. Our experts will review your task and contact you soon.'
        });

        // Reset form on success
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
      } else {
        // Handle API errors with detailed information
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: result
        });
        
        let errorMessage = 'Failed to submit task';
        
        if (result.detail) {
          errorMessage = result.detail;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        } else if (typeof result === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(result)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
        
        toast.error(`Submission failed (${response.status})`, {
          id: 'task-submit',
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Task submission error:', error);
      toast.error('Network error', {
        id: 'task-submit',
        description: 'Unable to connect to the server. Please check your connection and try again.'
      });
    }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate file size (max 10MB per file)
    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: `${file.name} exceeds the 10MB limit.`
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setAttachedFiles([...attachedFiles, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully!`, {
        description: validFiles.map(f => f.name).join(', ')
      });
    }

    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveDraft = () => {
    toast.info('Draft saved', {
      description: 'Your task has been saved as a draft. You can continue editing later.'
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    toast.info('File removed', {
      description: 'The file has been removed from your task.'
    });
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
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline ? format(formData.deadline, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Create date in local timezone to avoid timezone shift issues
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      setFormData({...formData, deadline: date});
                    } else {
                      setFormData({...formData, deadline: undefined});
                    }
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                />
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
                <Button type="button" variant="outline" size="sm" onClick={handleFileButtonClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              />
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
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