# TheGradHelper - Academic Success Platform

A comprehensive academic assistance platform that connects students with expert tutors and provides tools for assignment management, project collaboration, and academic success.

## Features

### For Students
- **Post Tasks**: Submit assignments and projects for expert assistance
- **Dashboard**: Track progress, deadlines, and academic performance
- **Meetings**: Schedule consultations with experts
- **Partnership Program**: Earn money by referring other students
- **Real-time Chat**: Communicate directly with admins and experts
- **Deliverables Management**: Track project milestones and submissions
- **Profile Management**: Complete academic profile for better matching

### For Admins
- **Task Management**: Review and assign student tasks
- **Student Management**: View and manage student accounts
- **Billing System**: Create and manage invoices
- **Meetings**: Schedule and manage expert consultations
- **Testimonials**: Collect and manage student feedback
- **Help Desk**: Respond to student support requests

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Local Storage**: Browser localStorage for session management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thegradhelper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── figma/          # Figma-specific components
│   └── *.tsx           # Feature components
├── styles/             # CSS files
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Key Components

- **LandingPage**: Marketing page with hero section, features, and testimonials
- **AuthPage**: Authentication with email/password and Google OAuth
- **ProfileCompletion**: Onboarding flow for new users
- **AppLayout**: Main application layout with navigation
- **StudentDashboard**: Student-specific dashboard and analytics
- **AdminDashboard**: Admin-specific dashboard and management tools
- **PostTask**: Task submission form for students
- **TaskManagement**: Task viewing and management interface

## Styling

The application uses a custom design system built on Tailwind CSS v4 with:
- Custom color palette (blue-green gradient theme)
- Responsive design patterns
- Dark mode support (infrastructure ready)
- Consistent spacing and typography

## State Management

- **Local State**: React useState for component-level state
- **Context API**: NotificationProvider for global notifications
- **Local Storage**: User session and preferences persistence

## Features in Detail

### Authentication Flow
1. Landing page introduction
2. Sign up/Sign in with email or Google
3. Profile completion (optional)
4. Dashboard access

### Task Management
1. Students post tasks with requirements
2. Admins review and assign tasks
3. Deliverables tracking and approval
4. Billing and payment processing

### Communication
- Real-time chat system
- Meeting scheduling
- Notification system
- Email integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary and confidential.

## Contact

- Email: iconmaxwells@gmail.com
- Phone: +44 7985 733795
- Powered by OMSOFT TECHNOLOGIES

---

© 2025 TheGradHelper. All rights reserved.