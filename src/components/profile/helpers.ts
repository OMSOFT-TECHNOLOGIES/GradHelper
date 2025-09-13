export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export const formatGraduationDate = (dateString: string): string => {
  if (!dateString) return 'Not provided';
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

export const simulateApiCall = (delay: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const createProfileUpdateHandler = (
  setEditedUser: (updater: (prev: any) => any) => void
) => {
  return (field: string, value: string) => {
    setEditedUser((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
};