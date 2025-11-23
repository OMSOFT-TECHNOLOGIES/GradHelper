export const PROFILE_FIELDS = {
  PERSONAL: {
    name: 'Full Name',
    email: 'Email Address', 
    phone: 'Phone Number',
    location: 'Location',
    bio: 'Bio'
  },
  ACADEMIC: {
    university: 'University',
    degree: 'Degree Program',
    year: 'Year of Study',
    graduationDate: 'Expected Graduation',
    specialization: 'Area of Specialization'
  }
} as const;

export const PLACEHOLDERS = {
  name: 'Enter your full name',
  email: 'Enter your email',
  phone: 'Enter your phone number',
  location: 'Enter your location',
  bio: 'Tell us about yourself...',
  university: 'Enter your university',
  degree: 'e.g., Bachelor of Science in Computer Science',
  year: 'e.g., 3rd Year, Final Year',
  specialization: 'Describe your area of focus or specialization...'
} as const;

export const NOTIFICATION_SETTINGS = [
  {
    id: 'emailNotifications',
    label: 'Email Notifications',
    description: 'Receive notifications about task updates and messages',
    defaultChecked: true
  },
  {
    id: 'marketingEmails', 
    label: 'Marketing Emails',
    description: 'Receive updates about new features and promotions',
    defaultChecked: false
  },

] as const;