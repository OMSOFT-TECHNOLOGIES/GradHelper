import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Users, 
  Star, 
  MessageCircle,
  Shield,
  Award,
  Zap,
  Target,
  Lightbulb,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  BarChart3,
  UserCheck,
  FileCheck,
  Video,
  Brain,
  Code,
  Database,
  Briefcase,
  PenTool,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  FileText,
  Cpu,
  Binary,
  Trophy,
  TrendingUp,
  Medal
} from 'lucide-react';
import logoImage from '../assets/71eefff8a544630cca22726eead746724ce853a1.png';
import servicesImage from '../assets/b7c125602c03f55d969e304152171635767e723c.png';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onPostTask: () => void;
}

interface Accomplishment {
  id: string;
  title: string;
  description: string;
  category: 'student_success' | 'milestone' | 'recognition' | 'partnership' | 'innovation' | 'community';
  metric?: string;
  date: string;
  imageUrl?: string;
  isPublished: boolean;
  featured: boolean;
}

export function LandingPage({ onGetStarted, onSignIn, onPostTask }: LandingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);

  const heroSlides = [
    {
      title: "Boost Your Academic Success with Expert Help",
      highlight: "Expert Help",
      description: "Get personalized assistance from qualified professionals for assignments, projects, and research. Join over 50,000 students who've improved their grades.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
      stats: [
        { number: "50,000+", label: "Students Helped" },
        { number: "25,000+", label: "Projects Completed" },
        { number: "98%", label: "Success Rate" },
        { number: "4.9/5", label: "Average Rating" }
      ]
    },
    {
      title: "24/7 Support for Your Academic Journey", 
      highlight: "24/7 Support",
      description: "Never miss a deadline again. Our round-the-clock support ensures you get help whenever you need it, from any timezone.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
      stats: [
        { number: "24/7", label: "Available Support" },
        { number: "2 hrs", label: "Avg Response Time" },
        { number: "150+", label: "Expert Writers" },
        { number: "100%", label: "Confidential" }
      ]
    },
    {
      title: "Transform Your Grades with Professional Writers",
      highlight: "Professional Writers", 
      description: "Work with PhD-qualified experts in your field. Get original, high-quality content that meets your exact requirements.",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop",
      stats: [
        { number: "PhD+", label: "Qualified Writers" },
        { number: "100%", label: "Original Content" },
        { number: "0%", label: "Plagiarism" },
        { number: "A+", label: "Average Grade" }
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      university: "MIT", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "TheGradHelper completely transformed my final year project experience. The expert guidance was incredible, and I achieved the highest grade in my class!"
    },
    {
      name: "Mike Wilson", 
      role: "Business Major",
      university: "Harvard Business School",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "I was struggling with my MBA dissertation until I found TheGradHelper. The quality of research and writing support was outstanding. Highly recommend!"
    },
    {
      name: "Emily Davis",
      role: "Psychology PhD", 
      university: "Stanford University",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "As a PhD student, I needed specialized help with statistical analysis. TheGradHelper connected me with the perfect expert. Professional and reliable!"
    },
    {
      name: "James Chen",
      role: "Engineering Student",
      university: "UC Berkeley", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "The project development support was amazing. They helped me build a complex system that impressed my professors. Couldn't have done it without them!"
    },
    {
      name: "Maria Rodriguez",
      role: "Medical Student",
      university: "Johns Hopkins",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "Research paper writing was always my weakness. TheGradHelper taught me how to structure arguments and cite properly. My grades improved dramatically!"
    },
    {
      name: "David Thompson",
      role: "Law Student", 
      university: "Yale Law School",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      rating: 5,
      text: "Legal research is complex, but their experts made it manageable. They provided case analysis that helped me excel in constitutional law. Exceptional service!"
    }
  ];

  // New service cards matching the first screenshot
  const serviceCards = [
    {
      title: "Build a compelling final year project or assignment",
      description: "Receive real-time expert guidance to fully understand your project.",
      className: "service-card-blue"
    },
    {
      title: "Aim for nothing less than a 'B'",
      description: "We build your project and help you grasp every concept before your presentation.",
      className: "service-card-green"
    },
    {
      title: "Seamless Deliverables",
      description: "Every deliverable is polished and presentation-ready —with ongoing support.",
      className: "service-card-dark"
    }
  ];

  // New support features matching the second screenshot
  const supportFeatures = [
    {
      icon: BarChart3,
      title: "Expert Analysis",
      description: "We break down your requirements and ensure technical accuracy in every task."
    },
    {
      icon: UserCheck,
      title: "1-On-1 Support",
      description: "Chat with us anytime—get real-time updates and answers to all your questions."
    },
    {
      icon: FileCheck,
      title: "Secure File Handling",
      description: "Your documents and data are safe, encrypted, and handled professionally."
    },
    {
      icon: Video,
      title: "Collaboration & Meetings",
      description: "Schedule check-ins and review sessions to stay involved throughout the process."
    }
  ];

  const detailedServices = [
    {
      title: "Masters Final Year Projects",
      description: "Comprehensive support for MSc final year projects in all IT/CS related courses.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
      icon: GraduationCap
    },
    {
      title: "Theses & Dissertations",
      description: "Expert guidance for undergraduate and postgraduate thesis writing and research.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
      icon: FileText
    },
    {
      title: "Academic Writings",
      description: "Professional support for research papers, essays, and academic publications.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
      icon: PenTool
    },
    {
      title: "AI & Machine Learning",
      description: "Specialized projects in artificial intelligence, ML algorithms, and deep learning.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1525338078858-d762b5e32f2c?w=400&h=300&fit=crop",
      icon: Brain
    },
    {
      title: "Cyber Security",
      description: "Security analysis, penetration testing, and cybersecurity project development.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1590065707046-4fde65275b2e?w=400&h=300&fit=crop",
      icon: Shield
    },
    {
      title: "General Programming Projects",
      description: "Full-stack development, mobile apps, and software engineering projects.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1625459201773-9b2386f53ca2?w=400&h=300&fit=crop",
      icon: Code
    },
    {
      title: "Software Contracts",
      description: "Custom software development and freelance programming project assistance.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop",
      icon: Briefcase
    },
    {
      title: "Data Science Projects",
      description: "Data analysis, visualization, statistical modeling, and big data projects.",
      link: "Explore Now →",
      image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?w=400&h=300&fit=crop",
      icon: Database
    }
  ];

  // Load accomplishments from localStorage
  useEffect(() => {
    const savedAccomplishments = localStorage.getItem('gradhelper_accomplishments');
    if (savedAccomplishments) {
      const allAccomplishments: Accomplishment[] = JSON.parse(savedAccomplishments);
      // Only show published accomplishments on landing page
      const publishedAccomplishments = allAccomplishments.filter(a => a.isPublished);
      setAccomplishments(publishedAccomplishments);
    }
  }, []);

  // Load featured testimonies from localStorage
  useEffect(() => {
    const savedTestimonies = localStorage.getItem('gradhelper_testimonies');
    if (savedTestimonies) {
      const allTestimonies = JSON.parse(savedTestimonies);
      // Only show approved and featured testimonies on landing page
      const featuredTestimonies = allTestimonies
        .filter((t: any) => t.status === 'approved' || t.status === 'featured')
        .map((t: any) => ({
          name: t.studentName,
          role: t.studentProgram || 'Student',
          university: t.studentUniversity || 'University',
          avatar: t.studentAvatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face`,
          rating: t.rating,
          text: t.content
        }));
      
      if (featuredTestimonies.length > 0) {
        setDynamicTestimonials(featuredTestimonies);
      }
    }
  }, []);

  // Hero slider auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Testimonials auto-advance
  useEffect(() => {
    const testimonialsToUse = dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialsToUse.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length, dynamicTestimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextTestimonial = () => {
    const testimonialsToUse = dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;
    setCurrentTestimonial((prev) => (prev + 1) % testimonialsToUse.length);
  };

  const prevTestimonial = () => {
    const testimonialsToUse = dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;
    setCurrentTestimonial((prev) => (prev - 1 + testimonialsToUse.length) % testimonialsToUse.length);
  };

  const getVisibleTestimonials = () => {
    // Use dynamic testimonials if available, otherwise fall back to static ones
    const testimonialsToUse = dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials;
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentTestimonial + i) % testimonialsToUse.length;
      visible.push(testimonialsToUse[index]);
    }
    return visible;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'student_success': GraduationCap,
      'milestone': Target,
      'recognition': Trophy,
      'partnership': Users,
      'innovation': TrendingUp,
      'community': Medal
    };
    return iconMap[category] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'student_success': 'bg-green-500',
      'milestone': 'bg-blue-500',
      'recognition': 'bg-yellow-500',
      'partnership': 'bg-purple-500',
      'innovation': 'bg-indigo-500',
      'community': 'bg-pink-500'
    };
    return colorMap[category] || 'bg-gray-500';
  };

  // Get featured accomplishments for display
  const featuredAccomplishments = accomplishments.filter(a => a.featured).slice(0, 3);
  const recentAccomplishments = accomplishments.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <img src={logoImage} alt="TheGradHelper" className="w-6 h-6 filter brightness-0 invert" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">GradHelper</h1>
                <p className="text-xs text-gray-500 -mt-1">Academic Excellence</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Services
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Reviews
              </a>
              <a href="#support" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Support
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                className="hidden sm:block text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200" 
                onClick={onSignIn}
              >
                Sign In
              </button>
              <button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={onGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Hero Slider */}
        <div className="relative">
          {heroSlides.map((slide, index) => (
            <div 
              key={index} 
              className={`${index === currentSlide ? 'block' : 'hidden'} transition-all duration-1000 ease-in-out`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Hero Content */}
                  <div className="space-y-8">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-sm font-medium text-blue-800 shadow-sm">
                      <Award className="w-4 h-4 mr-2" />
                      Trusted by 50,000+ Students Worldwide
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      {slide.title.split(slide.highlight)[0]}
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {slide.highlight}
                      </span>
                      {slide.title.split(slide.highlight)[1]}
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                      {slide.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                        onClick={onPostTask}
                      >
                        <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        Post Your Task
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                      <button className="group bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Watch Demo
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                      {slide.stats.map((stat, statIndex) => (
                        <div key={statIndex} className="text-center lg:text-left">
                          <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                            {stat.number}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero Image */}
                  <div className="relative lg:pl-8">
                    <div className="relative">
                      {/* Background Elements */}
                      <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-2xl opacity-60"></div>
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-100 rounded-2xl opacity-60"></div>
                      
                      {/* Main Image */}
                      <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                        <img 
                          src={slide.image} 
                          alt="Students achieving academic success" 
                          className="w-full h-80 lg:h-96 object-cover rounded-xl"
                        />
                        
                        {/* Floating Success Card */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">Success Rate</div>
                              <div className="text-2xl font-bold text-green-600">98%</div>
                            </div>
                          </div>
                        </div>

                        {/* Floating Rating Card */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="font-semibold text-gray-900">4.9/5</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">2,500+ Reviews</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full transition-all duration-200 hover:shadow-md"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-2 mx-4">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            
            <button 
              className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-full transition-all duration-200 hover:shadow-md"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section id="services" className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Service Categories Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {serviceCards.map((card, index) => (
              <div 
                key={index} 
                className="group bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:bg-white transition-all duration-300 hover:-translate-y-2"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Main CTA Section */}
          <div className="text-center mb-20">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-lg">
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6">
                Specialized Support For 
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Computer Science, AI, Data Science</span>, 
                Cybersecurity And All I.T Related Students
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                Expert assistance at all academic levels across the globe with personalized support tailored to your needs
              </p>
              <button 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={onGetStarted}
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Detailed Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {detailedServices.map((service, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Service Image */}
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      24/7 Expert Support
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Plagiarism-Free Work
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      On-Time Delivery
                    </div>
                  </div>

                  <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={onPostTask}
                  >
                    {service.link}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm font-medium text-green-800 mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get expert academic help in just four simple steps. Our streamlined process ensures you receive quality assistance quickly and efficiently.
            </p>
          </div>

          {/* Steps Flow */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-blue-200 via-green-200 to-purple-200 transform -translate-y-1/2"></div>
            
            {/* Steps Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="text-2xl font-bold text-white">1</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  Post Your Task
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Share your assignment details, deadline, and requirements with our secure platform in minutes.
                </p>
              </div>

              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="text-2xl font-bold text-white">2</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  Get Matched
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI matches you with the perfect expert based on your subject, academic level, and specific needs.
                </p>
              </div>

              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="text-2xl font-bold text-white">3</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                  Collaborate
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Work directly with your expert through our messaging system and track progress in real-time.
                </p>
              </div>

              <div className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="text-2xl font-bold text-white">4</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-100 rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Succeed
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive high-quality, plagiarism-free work on time and boost your academic performance.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
              <div className="text-gray-600">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Support Section - Based on Second Screenshot */}
      <section id="support" className="support-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Reliable Help For Your Toughest Assignments</h2>
            <p className="section-description">
              Get personalized guidance and timely delivery to help you meet deadlines without burnout
            </p>
          </div>
          <div className="support-features-grid">
            {supportFeatures.map((feature, index) => (
              <div key={index} className="support-feature-card">
                <div className="support-feature-icon">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="support-feature-title">{feature.title}</h3>
                <p className="support-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-yellow-800 mb-6">
              <Star className="w-4 h-4 mr-2" />
              Student Success Stories
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Students
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Say About Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Join over 50,000 satisfied students who've achieved their academic goals with our expert guidance and personalized support
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
                <div className="text-gray-600 font-medium">Happy Students</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-gray-900">4.9</span>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div 
                key={`${currentTestimonial}-${index}`} 
                className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                {/* Rating and University */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {testimonial.university}
                  </div>
                </div>
                
                {/* Testimonial Text */}
                <blockquote className="text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonial.text}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-gray-200">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="mt-4 flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Verified Student</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4">
            <button 
              className="p-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
            </button>
            
            <div className="flex space-x-2">
              {(dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="p-3 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md group"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Accomplishments Section */}
      {accomplishments.length > 0 && (
        <section id="accomplishments" className="accomplishments-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Achievements</h2>
              <p className="section-description">
                Celebrating milestones and success stories that showcase our commitment to academic excellence
              </p>
            </div>

            {/* Featured Accomplishments */}
            {featuredAccomplishments.length > 0 && (
              <div className="featured-accomplishments">
                <h3 className="featured-title">Featured Achievements</h3>
                <div className="featured-grid">
                  {featuredAccomplishments.map((accomplishment) => {
                    const CategoryIcon = getCategoryIcon(accomplishment.category);
                    const categoryColor = getCategoryColor(accomplishment.category);
                    
                    return (
                      <div key={accomplishment.id} className="featured-accomplishment-card">
                        <div className="accomplishment-header">
                          <div className={`accomplishment-icon ${categoryColor}`}>
                            <CategoryIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="accomplishment-badge">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>Featured</span>
                          </div>
                        </div>
                        
                        {accomplishment.imageUrl && (
                          <div className="accomplishment-image">
                            <img src={accomplishment.imageUrl} alt={accomplishment.title} />
                          </div>
                        )}
                        
                        <div className="accomplishment-content">
                          {accomplishment.metric && (
                            <div className="accomplishment-metric">{accomplishment.metric}</div>
                          )}
                          <h4 className="accomplishment-title">{accomplishment.title}</h4>
                          <p className="accomplishment-description">{accomplishment.description}</p>
                          <div className="accomplishment-date">
                            {new Date(accomplishment.date).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Recent Accomplishments */}
            <div className="all-accomplishments">
              <h3 className="accomplishments-title">Recent Milestones</h3>
              <div className="accomplishments-grid">
                {recentAccomplishments.map((accomplishment) => {
                  const CategoryIcon = getCategoryIcon(accomplishment.category);
                  const categoryColor = getCategoryColor(accomplishment.category);
                  
                  return (
                    <div key={accomplishment.id} className="accomplishment-card">
                      <div className="accomplishment-card-header">
                        <div className={`accomplishment-card-icon ${categoryColor}`}>
                          <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        {accomplishment.featured && (
                          <div className="accomplishment-featured-badge">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          </div>
                        )}
                      </div>
                      
                      <div className="accomplishment-card-content">
                        {accomplishment.metric && (
                          <div className="accomplishment-card-metric">{accomplishment.metric}</div>
                        )}
                        <h5 className="accomplishment-card-title">{accomplishment.title}</h5>
                        <p className="accomplishment-card-description">{accomplishment.description}</p>
                        <div className="accomplishment-card-date">
                          {new Date(accomplishment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Call to Action */}
            <div className="accomplishments-cta">
              <div className="accomplishments-cta-content">
                <h3>Ready to Join Our Success Stories?</h3>
                <p>Be part of our growing community of successful students and achieve your academic goals with expert guidance.</p>
                <button className="btn-hero-primary" onClick={onGetStarted}>
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Professional Referral Partnership Section */}
      <section className="referral-section-professional">
        <div className="container">
          <div className="referral-content-professional">
            <div className="referral-left">
              <div className="partnership-badge">
                <Users className="w-4 h-4" />
                <span>Partnership Program</span>
              </div>
              
              <h2 className="referral-main-title">Earn While You Study</h2>
              
              <p className="referral-main-description">
                Become a TheGradHelper campus representative and earn 10% commission for every student you refer. 
                Help your fellow students succeed while building your income stream.
              </p>
              
              <div className="benefits-grid-professional">
                <div className="benefit-item-professional">
                  <div className="benefit-icon-professional dollar">
                    <span>$</span>
                  </div>
                  <div className="benefit-content-professional">
                    <h4 className="benefit-title-professional">10% Commission</h4>
                    <p className="benefit-desc-professional">Earn from every successful referral</p>
                  </div>
                </div>
                
                <div className="benefit-item-professional">
                  <div className="benefit-icon-professional users">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="benefit-content-professional">
                    <h4 className="benefit-title-professional">Campus Rep Status</h4>
                    <p className="benefit-desc-professional">Become the go-to person for academic help</p>
                  </div>
                </div>
                
                <div className="benefit-item-professional">
                  <div className="benefit-icon-professional clock">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="benefit-content-professional">
                    <h4 className="benefit-title-professional">Flexible Schedule</h4>
                    <p className="benefit-desc-professional">Work around your studies</p>
                  </div>
                </div>
              </div>
              
              <button className="join-partnership-btn" onClick={onGetStarted}>
                Join Partnership Program
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <div className="trust-indicator">
                <Shield className="w-4 h-4" />
                <span>Trusted by students at 200+ universities worldwide</span>
              </div>
            </div>
            
            <div className="referral-right">
              <div className="earnings-card-professional">
                <div className="earnings-header">
                  <h3>Monthly Earnings Potential</h3>
                </div>
                
                <div className="earnings-tiers">
                  <div className="tier-item">
                    <div className="tier-referrals">5 referrals</div>
                    <div className="tier-amount">$250/month</div>
                  </div>
                  
                  <div className="tier-item featured-tier">
                    <div className="tier-badge-featured">Most Popular</div>
                    <div className="tier-referrals">15 referrals</div>
                    <div className="tier-amount">$750/month</div>
                  </div>
                  
                  <div className="tier-item">
                    <div className="tier-referrals">30+ referrals</div>
                    <div className="tier-amount">$1,500+/month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion Section */}
      <section className="profile-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Complete Your Profile</h2>
            <p className="section-description">
              Get personalized assistance by sharing more about your academic needs
            </p>
          </div>
          
          <div className="profile-card">
            <div className="profile-features">
              <div className="profile-feature">
                <div className="profile-feature-icon">
                  <User className="w-6 h-6" />
                </div>
                <div className="profile-feature-text">
                  <h4>Personal Details</h4>
                  <p>Basic information for better communication</p>
                </div>
              </div>
              
              <div className="profile-feature">
                <div className="profile-feature-icon">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="profile-feature-text">
                  <h4>Academic Background</h4>
                  <p>Match with experts in your field</p>
                </div>
              </div>
              
              <div className="profile-feature">
                <div className="profile-feature-icon">
                  <Target className="w-6 h-6" />
                </div>
                <div className="profile-feature-text">
                  <h4>Learning Preferences</h4>
                  <p>Customize your experience</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button className="btn-hero-primary" onClick={onGetStarted}>
                Complete Profile & Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
            
            <div className="security-badges">
              <div className="security-badge">
                <Shield className="security-badge-icon" />
                <span className="security-badge-text">SSL Encrypted</span>
              </div>
              <div className="security-badge">
                <Lock className="security-badge-icon" />
                <span className="security-badge-text">GDPR Compliant</span>
              </div>
              <div className="security-badge">
                <CheckCircle className="security-badge-icon" />
                <span className="security-badge-text">100% Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Boost Your Grades?</h2>
            <p className="cta-description">
              Join thousands of students who've achieved academic success with TheGradHelper
            </p>
            <div className="cta-actions">
              <button className="btn-hero-primary" onClick={onPostTask}>
                Post Your First Task
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="btn-hero-outline">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center">
                    <img src={logoImage} alt="TheGradHelper" className="h-8 w-auto filter brightness-0 invert" />
                  </div>
                  <div className="text-2xl font-bold">TheGradHelper</div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-8 max-w-md">
                  Empowering students worldwide to achieve academic excellence through expert guidance, personalized support, and innovative learning solutions.
                </p>
                
                {/* Contact Information */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email us</div>
                      <div className="text-white font-medium">iconmaxwells@gmail.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Call us</div>
                      <div className="text-white font-medium">+44 7985 733795</div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-400 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-blue-700 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              {/* Services Links */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Academic Services</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Final Year Projects
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Assignment Help
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Research Support
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    CS/IT Projects
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Data Science
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    AI & Machine Learning
                  </a></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Support & Info</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Help Center
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Live Chat Support
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    About Us
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Success Stories
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Privacy Policy
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    Terms of Service
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-center lg:text-left">
                © 2025 TheGradHelper. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Powered by</span>
                <div className="font-semibold text-white">OMSOFT TECHNOLOGIES</div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-200">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors duration-200">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors duration-200">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}