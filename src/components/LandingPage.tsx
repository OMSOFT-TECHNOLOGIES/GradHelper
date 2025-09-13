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
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="TheGradHelper" className="h-12 w-auto" />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="nav-link">Services</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#testimonials" className="nav-link">Reviews</a>
              <a href="#support" className="nav-link">Support</a>
            </nav>
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost btn-sm" onClick={onSignIn}>Sign In</button>
              <button className="btn btn-primary" onClick={onGetStarted}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slider */}
      <section className="hero-section">
        <div className="hero-slider">
          {heroSlides.map((slide, index) => (
            <div 
              key={index} 
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">
                      {slide.title.split(slide.highlight)[0]}
                      <span className="gradient-text">{slide.highlight}</span>
                      {slide.title.split(slide.highlight)[1]}
                    </h1>
                    <p className="hero-description">
                      {slide.description}
                    </p>
                    <div className="hero-actions">
                      <button className="btn-hero-primary" onClick={onPostTask}>
                        <BookOpen className="w-5 h-5 mr-2" />
                        Post Your Task
                      </button>
                      <button className="btn-hero-outline">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Watch Demo
                      </button>
                    </div>
                    <div className="hero-stats">
                      {slide.stats.map((stat, statIndex) => (
                        <div key={statIndex} className="stat-item">
                          <div className="stat-number">{stat.number}</div>
                          <div className="stat-label">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hero-image">
                    <div className="hero-placeholder">
                      <img 
                        src={slide.image} 
                        alt="Students studying" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Navigation */}
        <button className="hero-nav-arrow prev" onClick={prevSlide}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button className="hero-nav-arrow next" onClick={nextSlide}>
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="hero-nav">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`hero-nav-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* New Services Section - Based on First Screenshot */}
      <section id="services" className="new-services-section">
        <div className="container">
          <div className="services-cards-grid">
            {serviceCards.map((card, index) => (
              <div key={index} className={`service-card-new ${card.className}`}>
                <h3 className="service-card-title">{card.title}</h3>
                <p className="service-card-description">{card.description}</p>
              </div>
            ))}
          </div>
          
          <div className="services-subtitle">
            <p>
              Specialized Support For Computer Science, AI, Data Science, Cybersecurity<br />
              And All I.T Related Students At All Levels Across The Globe.
            </p>
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Get Started
            </button>
          </div>

          {/* Detailed Services Grid */}
          <div className="detailed-services-grid">
            {detailedServices.map((service, index) => (
              <div key={index} className="detailed-service-card">
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                  <div className="service-icon-overlay">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="service-content">
                  <h4 className="service-title">{service.title}</h4>
                  <p className="service-description">{service.description}</p>
                  <button 
                    className="service-link-btn"
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

      {/* How It Works Section - Keep existing */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Simple steps to get the academic help you need
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Post Your Task</h3>
              <p className="step-description">
                Share your assignment details, deadline, and requirements with our platform.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Get Matched</h3>
              <p className="step-description">
                We connect you with the perfect expert for your subject and academic level.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Collaborate</h3>
              <p className="step-description">
                Work directly with your expert, track progress, and receive regular updates.
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Succeed</h3>
              <p className="step-description">
                Receive high-quality work on time and boost your academic performance.
              </p>
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

      {/* Testimonials Section with Professional Layout */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Students Say</h2>
            <p className="section-description">
              Join over 50,000 satisfied students who've achieved their academic goals with our expert guidance
            </p>
            <div className="testimonials-stats">
              <div className="testimonial-stat">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Happy Students</div>
              </div>
              <div className="testimonial-stat">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="testimonial-stat">
                <div className="stat-number">98%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="testimonials-grid">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div key={`${currentTestimonial}-${index}`} className="testimonial-card-professional">
                <div className="testimonial-header">
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
                    ))}
                  </div>
                  <div className="testimonial-university">{testimonial.university}</div>
                </div>
                
                <blockquote className="testimonial-quote">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="testimonial-author-professional">
                  <div className="author-avatar-professional">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  </div>
                  <div className="author-info">
                    <div className="author-name-professional">{testimonial.name}</div>
                    <div className="author-role-professional">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="testimonials-navigation">
            <button 
              className="testimonial-nav-btn" 
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="testimonials-dots">
              {(dynamicTestimonials.length > 0 ? dynamicTestimonials : testimonials).map((_, index) => (
                <button
                  key={index}
                  className={`testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="testimonial-nav-btn" 
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
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

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="flex items-center gap-3 mb-4">
                <img src={logoImage} alt="TheGradHelper" className="h-10 w-auto filter brightness-0 invert" />
              </div>
              <p className="text-muted-foreground">
                Empowering students to achieve academic excellence through expert guidance and support.
              </p>
              
              {/* Contact Information */}
              <div className="footer-contact">
                <div className="contact-info">
                  <div className="contact-item">
                    <Mail className="contact-icon" />
                    <span>iconmaxwells@gmail.com</span>
                  </div>
                  <div className="contact-item">
                    <Phone className="contact-icon" />
                    <span>+44 7985 733795</span>
                  </div>
                </div>
                <div className="powered-by">
                  Powered by OMSOFT TECHNOLOGIES
                </div>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4 className="link-group-title">Services</h4>
                <ul className="link-list">
                  <li><a href="#" className="footer-link">Final Year Projects</a></li>
                  <li><a href="#" className="footer-link">Assignment Help</a></li>
                  <li><a href="#" className="footer-link">Research Support</a></li>
                  <li><a href="#" className="footer-link">CS/IT Projects</a></li>
                  <li><a href="#" className="footer-link">Data Science</a></li>
                  <li><a href="#" className="footer-link">AI & Machine Learning</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4 className="link-group-title">Company</h4>
                <ul className="link-list">
                  <li><a href="#" className="footer-link">About TheGradHelper</a></li>
                  <li><a href="#" className="footer-link">Our Experts</a></li>
                  <li><a href="#" className="footer-link">Success Stories</a></li>
                  <li><a href="#" className="footer-link">Careers</a></li>
                  <li><a href="#" className="footer-link">Blog</a></li>
                  <li><a href="#" className="footer-link">Partnership</a></li>
                </ul>
              </div>
              <div className="link-group">
                <h4 className="link-group-title">Support</h4>
                <ul className="link-list">
                  <li><a href="#" className="footer-link">Help Center</a></li>
                  <li><a href="#" className="footer-link">Live Chat Support</a></li>
                  <li><a href="#" className="footer-link">Contact Us</a></li>
                  <li><a href="#" className="footer-link">Terms of Service</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                  <li><a href="#" className="footer-link">Refund Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="text-muted-foreground">
              © 2025 TheGradHelper. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}