import React, { useState } from 'react';
import { Bell, Send, Users, AlertCircle, Settings, CheckCircle, X } from 'lucide-react';
import { useNotifications } from './NotificationContextAPI';

interface AdminNotificationManagerProps {
  userRole: 'student' | 'admin';
}

export function AdminNotificationManager({ userRole }: AdminNotificationManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    notification_type: 'system_announcement',
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    action_url: '',
    action_text: '',
    metadata: {}
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const { createNotification, isLoading } = useNotifications();

  // Only admins can access this component
  if (userRole !== 'admin') {
    return (
      <div className="admin-notifications-manager max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can create notifications.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate required fields
      if (!formData.title || !formData.message) {
        setError('Title and message are required.');
        return;
      }

      // Convert user_id to number if provided
      const notificationData = {
        ...formData,
        user_id: formData.user_id ? parseInt(formData.user_id) : undefined,
        metadata: formData.metadata || {}
      };

      // Remove empty optional fields
      const cleanData = { ...notificationData };
      if (!cleanData.action_url) {
        delete (cleanData as any).action_url;
      }
      if (!cleanData.action_text) {
        delete (cleanData as any).action_text;
      }
      
      await createNotification(cleanData);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form
      setFormData({
        user_id: '',
        notification_type: 'system_announcement',
        title: '',
        message: '',
        priority: 'medium',
        action_url: '',
        action_text: '',
        metadata: {}
      });
      
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create notification');
    }
  };

  const notificationTypes = [
    { value: 'system_announcement', label: 'System Announcement' },
    { value: 'task_assigned', label: 'Task Assignment' },
    { value: 'deliverable_reminder', label: 'Deliverable Reminder' },
    { value: 'payment_reminder', label: 'Payment Reminder' },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
    { value: 'profile_incomplete', label: 'Profile Incomplete' },
    { value: 'security_alert', label: 'Security Alert' },
    { value: 'maintenance_notice', label: 'Maintenance Notice' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  return (
    <div className="admin-notifications-manager max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Notification Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage system notifications for users
            </p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Create Notification
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">Notification created successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Notification Form */}
      {isCreating && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Create New Notification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User ID (Optional) */}
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
                    User ID (Optional)
                  </label>
                  <input
                    type="number"
                    id="user_id"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    placeholder="Leave empty for all users"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to send to all users</p>
                </div>

                {/* Notification Type */}
                <div>
                  <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Type *
                  </label>
                  <select
                    id="notification_type"
                    name="notification_type"
                    value={formData.notification_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Enter notification message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action URL */}
                <div>
                  <label htmlFor="action_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Action URL (Optional)
                  </label>
                  <input
                    type="text"
                    id="action_url"
                    name="action_url"
                    value={formData.action_url}
                    onChange={handleInputChange}
                    placeholder="/tasks or https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Action Text */}
                <div>
                  <label htmlFor="action_text" className="block text-sm font-medium text-gray-700 mb-1">
                    Action Text (Optional)
                  </label>
                  <input
                    type="text"
                    id="action_text"
                    name="action_text"
                    value={formData.action_text}
                    onChange={handleInputChange}
                    placeholder="View Details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Notification Guidelines
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">User Targeting:</strong>
            <ul className="ml-4 mt-1 list-disc">
              <li>Leave User ID empty to send to all users</li>
              <li>Specify a User ID to send to a specific user</li>
              <li>Use appropriate notification types for better organization</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-gray-900">Priority Levels:</strong>
            <ul className="ml-4 mt-1 list-disc">
              <li><span className="text-red-600 font-medium">Urgent:</span> Critical issues requiring immediate attention</li>
              <li><span className="text-orange-600 font-medium">High:</span> Important updates that should be seen soon</li>
              <li><span className="text-blue-600 font-medium">Medium:</span> Regular notifications and updates</li>
              <li><span className="text-gray-600 font-medium">Low:</span> Informational messages</li>
            </ul>
          </div>
          
          <div>
            <strong className="text-gray-900">Action URLs:</strong>
            <ul className="ml-4 mt-1 list-disc">
              <li>Use relative paths (e.g., "/tasks") for internal navigation</li>
              <li>Use full URLs (e.g., "https://example.com") for external links</li>
              <li>Action text should be descriptive (e.g., "View Task", "Read More")</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotificationManager;