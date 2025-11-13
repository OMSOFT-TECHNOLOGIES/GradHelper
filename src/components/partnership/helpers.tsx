import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { STATUS_COLORS } from './constants';

export const getStatusColor = (status: string) => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'badge-secondary';
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle className="w-4 h-4" />;
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'rejected': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export const filterRequests = (requests: any[], filter: string, searchTerm: string) => {
  return requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
};

export const getRequestCounts = (requests: any[]) => {
  return {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };
};