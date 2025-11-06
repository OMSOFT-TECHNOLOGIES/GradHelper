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

      // Deliverables removed from form submission

      // Log the data being sent for debugging
      console.log('Submitting task data:', taskData);
      console.log('Deliverables type:', typeof taskData.deliverables);
      console.log('Deliverables value:', taskData.deliverables);

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
        console.log('Before JSON.stringify - taskData.deliverables:', taskData.deliverables);
        console.log('Before JSON.stringify - typeof deliverables:', typeof taskData.deliverables);
        console.log('Before JSON.stringify - Array.isArray:', Array.isArray(taskData.deliverables));
        
        const jsonBody = JSON.stringify(taskData);
        console.log('JSON body being sent:', jsonBody);
        
        const parsedBack = JSON.parse(jsonBody);
        console.log('Parsed back for verification:', parsedBack);
        console.log('Parsed back deliverables type:', typeof parsedBack.deliverables);
        console.log('Parsed back deliverables Array.isArray:', Array.isArray(parsedBack.deliverables));
        
        response = await fetch(`${API_BASE_URL}/tasks/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: jsonBody,
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

  // Deliverable functions removed

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Academic Excellence
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Post Your Academic Task</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with expert academic professionals and get personalized assistance for your assignments, research papers, and projects
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Task Details
            </CardTitle>
            <CardDescription className="text-blue-100">
              Provide comprehensive information about your academic requirements
            </CardDescription>
          </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Task Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced Machine Learning Research Paper"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Task Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select your task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-blue-50">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Detailed Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide a comprehensive description of your task including:
                • Specific requirements and objectives
                • Topics to be covered or questions to be answered
                • Preferred approach or methodology
                • Special instructions or constraints
                • Expected outcomes or deliverables"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[140px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                required
              />
              <p className="text-xs text-gray-500">Be as specific as possible to ensure you receive the most accurate assistance</p>
            </div>

            {/* Academic Details Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Subject Area
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject} className="hover:bg-blue-50">{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicLevel" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Academic Level
                  </Label>
                  <Select value={formData.academicLevel} onValueChange={(value) => setFormData({...formData, academicLevel: value})}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicLevels.map((level) => (
                        <SelectItem key={level} value={level} className="hover:bg-blue-50">{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pages" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Page Count
                  </Label>
                  <Input
                    id="pages"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.pages}
                    onChange={(e) => setFormData({...formData, pages: e.target.value})}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                    max="500"
                  />
                </div>
              </div>
            </div>

            {/* Timeline and Budget Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Timeline & Budget</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Deadline *
                  </Label>
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
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500">When do you need this completed?</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Budget Range
                  </Label>
                  <Input
                    id="budget"
                    placeholder="e.g., $150-300 or Negotiable"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">Optional: Help experts understand your budget expectations</p>
                </div>
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

            {/* Deliverables section removed */}

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

            {/* Submit Section */}
            <div className="bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Task Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  className="h-12 border-gray-300 hover:bg-gray-50 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Draft
                </Button>
              </div>
              
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure & Confidential
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Expert Matching
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Quick Response
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

        {/* Professional Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50/50 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Writing Excellence</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Be specific about your requirements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Include relevant course materials</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Specify formatting requirements</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Smart Timing</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Allow time for revisions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Consider task complexity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Plan for quality review</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Quick Response</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Experts respond within 2 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 support availability</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time progress updates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}