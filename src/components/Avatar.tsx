import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Generate initials from name
  const getInitials = (fullName: string): string => {
    if (!fullName) return 'U';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Take first letter of first name and first letter of last name
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    
    return `${firstInitial}${lastInitial}`;
  };

  // Generate a consistent background color based on the name
  const getBackgroundColor = (fullName: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    // Create a simple hash from the name to consistently pick a color
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${bgColor} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-medium 
        select-none
        ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  );
}