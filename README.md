# 🎓 TheGradHelper - Academic Success Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/OMSOFT-TECHNOLOGIES/GradHelper)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A comprehensive, professional-grade academic assistance platform that connects students with expert tutors, providing modern tools for assignment management, project collaboration, and academic success. Built with React 18, TypeScript, and a modern UI component system.

---

## 🚀 Features Overview

### 👨‍🎓 **Student Features**
- **📝 Task Submission**: Submit assignments and projects with detailed requirements
- **📊 Smart Dashboard**: Real-time progress tracking, analytics, and deadline management  
- **🤝 Expert Meetings**: Schedule one-on-one consultations with academic experts
- **💰 Partnership Program**: Earn referral rewards and build academic networks
- **💬 Real-time Communication**: Integrated chat system with admins and experts
- **📋 Deliverables Management**: Track project milestones, submissions, and feedback
- **👤 Professional Profiles**: Complete academic profiles with skills and preferences
- **🎯 Accomplishments**: Showcase academic achievements and completed projects

### 🛡️ **Admin Features**
- **📑 Task Management**: Review, assign, and track student assignments
- **👥 Student Management**: Comprehensive student account administration
- **💳 Billing System**: Create invoices, manage payments, and financial tracking
- **📅 Meeting Coordination**: Schedule and manage expert-student consultations
- **⭐ Testimonial Management**: Collect and curate student success stories
- **🎯 Help Desk**: Multi-channel student support and issue resolution
- **📊 Analytics Dashboard**: Performance metrics, usage analytics, and insights
- **🔗 Partnership Requests**: Manage student partnership applications

### 🎨 **Modern UI/UX**
- **Professional Design System**: Consistent, accessible, and responsive interface
- **Dark/Light Theme**: Theme customization with system preference detection
- **Mobile-First**: Fully responsive design optimized for all devices
- **Micro-interactions**: Smooth animations and professional feedback systems
- **Component Library**: Radix UI-based components with custom styling

---

## 🛠️ Technology Stack

### **Frontend Core**
- **React 18** - Modern React with Concurrent Features
- **TypeScript 4.9** - Type-safe JavaScript development
- **Vite/CRA** - Fast development and optimized builds

### **UI & Styling**
- **Tailwind CSS v4** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful, consistent icon library
- **Sonner** - Modern toast notification system

### **State & Data Management**
- **React Context API** - Global state management
- **React Hook Form** - Performant form handling with validation
- **Local Storage** - Client-side persistence and session management
- **Date-fns** - Modern date utility library

### **Authentication & Payments**
- **Google OAuth** - Secure social authentication
- **Stripe Integration** - Payment processing and billing
- **JWT Tokens** - Secure session management

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **React Router v7** - Client-side routing
- **Recharts** - Data visualization and analytics

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/OMSOFT-TECHNOLOGIES/GradHelper.git
   cd GradHelper
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload when you make changes

### **Available Scripts**

| Command | Description |
|---------|-------------|
| `npm start` | 🔥 Runs the app in development mode |
| `npm build` | 📦 Builds the app for production to `build` folder |
| `npm test` | 🧪 Launches the test runner in interactive watch mode |
| `npm run eject` | ⚠️ Ejects from CRA (one-way operation) |

### **Environment Variables**
Create a `.env` file in the root directory:
```bash
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1

# Feature Flags
REACT_APP_ENABLE_PAYMENTS=true
REACT_APP_ENABLE_PARTNERSHIPS=true
```

---

## 📁 Project Structure

```
TheGradHelper/
├── 📁 public/                  # Static assets
├── 📁 src/
│   ├── 📁 components/          # React components
│   │   ├── 📁 ui/              # Reusable UI components (buttons, cards, etc.)
│   │   ├── 📁 figma/           # Figma-generated components
│   │   ├── 📁 profile/         # Profile management components
│   │   ├── 📁 partnership/     # Partnership system components
│   │   ├── 🔥 App.tsx          # Main application component
│   │   ├── 📊 StudentDashboard.tsx
│   │   ├── 🛡️ AdminDashboard.tsx
│   │   ├── 🏠 LandingPage.tsx
│   │   └── ... (other components)
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 services/            # API services and utilities
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 utils/               # Utility functions
│   └── 📁 styles/              # Global styles and themes
├── 📁 api/                     # Backend API (serverless functions)
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tailwind.config.js
└── 📄 README.md
```

## 🧩 Key Components Architecture

### **Core Application**
- **`App.tsx`** - Main app router and state management
- **`AppLayout.tsx`** - Navigation shell and layout system  
- **`LandingPage.tsx`** - Marketing homepage with hero and features
- **`AuthPage.tsx`** - Authentication with email/Google OAuth

### **User Management**
- **`ProfileCompletion.tsx`** - Guided onboarding flow
- **`ProfileView.tsx`** - Professional profile management interface
- **`SettingsView.tsx`** - Account settings and preferences

### **Student Features**
- **`StudentDashboard.tsx`** - Analytics, tasks, and quick actions
- **`PostTask.tsx`** - Task submission with requirements
- **`TaskManagement.tsx`** - Task tracking and collaboration
- **`MeetingsView.tsx`** - Expert consultation scheduling

### **Admin Features**  
- **`AdminDashboard.tsx`** - Management overview and analytics
- **`StudentsView.tsx`** - Student account management
- **`BillingView.tsx`** - Invoice creation and payment tracking
- **`PartnershipRequestsView.tsx`** - Partnership application reviews

### **Shared Systems**
- **`ChatView.tsx`** - Real-time messaging interface
- **`NotificationBell.tsx`** - Push notification system
- **`PaymentForm.tsx`** - Stripe payment integration
- **`HelpSupportView.tsx`** - Multi-channel support system

---

## 🎨 Design System

### **Visual Identity**
- **Color Palette**: Professional blue-indigo gradient theme with accent colors
- **Typography**: Inter font family with carefully crafted hierarchy
- **Spacing**: Consistent 4px grid system for perfect alignment
- **Animations**: Smooth micro-interactions with tailored easing curves

### **Component System**
```typescript
// Example: Professional button variants
<Button variant="primary" size="lg" className="gradient-blue">
  Get Started
</Button>

<Card className="glass-effect shadow-xl">
  <CardHeader>
    <CardTitle>Professional Card</CardTitle>
  </CardHeader>
  <CardContent>
    // Content with consistent spacing
  </CardContent>
</Card>
```

### **Responsive Design**
- **Mobile-First**: Optimized for mobile experience first
- **Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Grid System**: CSS Grid and Flexbox for complex layouts
- **Touch-Friendly**: 44px minimum touch targets

### **Accessibility Features**
- **WCAG 2.1 AA** compliance standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Semantic HTML with ARIA labels
- **Color Contrast**: 4.5:1 minimum contrast ratios

---

## 🔄 State Management

### **Architecture Overview**
```typescript
// Global State (Context API)
NotificationContext    // Toast notifications and alerts
AuthContext           // User authentication and session
ThemeContext         // Dark/light mode preferences

// Local State (React Hooks)  
useState             // Component-level state
useEffect            // Side effects and lifecycle
useProfile           // Custom hook for profile management
useTasks             // Custom hook for task operations
```

### **Data Persistence**
- **LocalStorage**: User preferences, session data, and offline capabilities
- **SessionStorage**: Temporary form data and navigation state
- **Cookies**: Authentication tokens and security settings

---

## 🔧 Feature Implementation Guide

### **🔐 Authentication System**
```typescript
// Multi-provider authentication flow
1. Landing Page → User Discovery
2. AuthPage → Email/Google OAuth
3. ProfileCompletion → Onboarding (if needed)
4. Dashboard → Full Application Access

// User object structure
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  profile: {
    isComplete: boolean;
    firstName: string;
    lastName: string;
    academicLevel: 'undergraduate' | 'graduate' | 'phd';
    institution: string;
    major: string;
    graduationYear: number;
    phone: string;
    country: string;
    bio: string;
    preferences: {
      communication: 'email' | 'phone' | 'chat';
      notifications: boolean;
      timezone: string;
    };
  };
}
```

### **📋 Task Management Workflow**
```typescript
// Complete task lifecycle
1. Student submits task (PostTask.tsx)
   ↓ 
2. Admin reviews requirements (AdminDashboard.tsx)
   ↓
3. Task assignment to expert
   ↓
4. Deliverables tracking (DeliverablesView.tsx)
   ↓
5. Student approval and payment (BillingView.tsx)

// Task object structure
interface Task {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'research';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  budget: number;
  studentId: string;
  expertId?: string;
  deliverables: Deliverable[];
}
```

### **💬 Real-Time Communication**
- **WebSocket Integration**: Live chat with admins and experts
- **Notification System**: Push notifications for task updates
- **Meeting Scheduler**: Calendar integration for expert consultations
- **Email Integration**: Automated communication workflows

### **💳 Payment & Billing System**
- **Stripe Integration**: Secure payment processing
- **Invoice Generation**: Automated billing for completed tasks  
- **Refund Management**: Flexible refund and dispute resolution
- **Partnership Earnings**: Referral reward calculations

---

## 🚀 Deployment

### **Production Build**
```bash
# Create optimized production build
npm run build

# The build folder contains the static files
# Deploy to your preferred hosting platform
```

### **Deployment Platforms**
- **Vercel**: Recommended for React applications
- **Netlify**: Alternative with continuous deployment
- **AWS S3**: Enterprise-grade static hosting
- **Firebase Hosting**: Google's hosting solution

### **Environment Configuration**
```bash
# Production environment variables
REACT_APP_API_BASE_URL=https://api.gradhelper.com/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Feature workflows and API integration  
- **E2E Tests**: Complete user journey testing
- **Accessibility Tests**: WCAG compliance validation

```bash
# Run test suite
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests (when configured)
npm run test:e2e
```

---

## 📈 Performance Optimization

### **Bundle Optimization**
- **Code Splitting**: Dynamic imports for route-based splitting
- **Tree Shaking**: Eliminate unused code
- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Components and routes loaded on demand

### **Runtime Performance**
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: Large lists with react-window
- **Service Workers**: Caching and offline capabilities
- **CDN Integration**: Static asset delivery optimization

---

## 🤝 Contributing

We welcome contributions to TheGradHelper! Please follow our contribution guidelines:

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Submit** a Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow the configured linting rules
- **Prettier**: Automatic code formatting
- **Commit Messages**: Use conventional commit format

### **Review Process**
- Code review required for all PRs
- Automated testing must pass
- Documentation updates for new features
- Performance impact assessment

---

## 📞 Support & Contact

### **Development Team**
- **Lead Developer**: iconmaxwells@gmail.com
- **Phone Support**: +44 7985 733795
- **Organization**: OMSOFT TECHNOLOGIES

### **Documentation**
- [API Documentation](./API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Styling Guide](./STYLING_GUIDE.md)
- [Payment Integration](./PAYMENT_INTEGRATION.md)

### **Community**
- **Issues**: Report bugs and request features
- **Discussions**: Community support and development discussions
- **Wiki**: Extended documentation and tutorials

---

## 📄 License

This project is **proprietary and confidential**. All rights reserved by OMSOFT TECHNOLOGIES.

**© 2025 TheGradHelper Platform. All rights reserved.**

---

<div align="center">

**Built with ❤️ by OMSOFT TECHNOLOGIES**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>