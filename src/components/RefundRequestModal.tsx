import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, Send, CheckCircle, FileText, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

interface RefundRequest {
  billId?: string;
  billTitle?: string;
  amount?: number;
  paymentDate?: string;
  reason: string;
  category: string;
  description: string;
  contactPreference: 'email' | 'phone';
  urgency: 'low' | 'medium' | 'high';
}

const REFUND_REASONS = [
  { id: 'quality', label: 'Quality of Work', description: 'The deliverable did not meet expectations' },
  { id: 'deadline', label: 'Missed Deadline', description: 'Work was not completed on time' },
  { id: 'communication', label: 'Poor Communication', description: 'Lack of updates or responsiveness' },
  { id: 'scope', label: 'Scope Issues', description: 'Work did not match the agreed requirements' },
  { id: 'technical', label: 'Technical Issues', description: 'Platform or system problems' },
  { id: 'duplicate', label: 'Duplicate Payment', description: 'Charged multiple times for the same service' },
  { id: 'other', label: 'Other', description: 'Different reason not listed above' }
];

export function RefundRequestModal({ isOpen, onClose, user }: RefundRequestModalProps) {
  const [step, setStep] = useState(1);
  const [refundRequest, setRefundRequest] = useState<RefundRequest>({
    reason: '',
    category: '',
    description: '',
    contactPreference: 'email',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof RefundRequest, value: any) => {
    setRefundRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!refundRequest.category || !refundRequest.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate email content for backend processing
      const emailContent = generateEmailContent();
      
      // In a real implementation, you would send this to your backend
      console.log('Refund request submitted:', {
        user,
        refundRequest,
        emailContent
      });

      // For now, open email client as fallback
      const subject = encodeURIComponent(`Refund Request - ${refundRequest.category} - ${user?.name}`);
      const body = encodeURIComponent(emailContent);
      window.open(`mailto:support@gradhelper.com?subject=${subject}&body=${body}`, '_blank');

      setSubmitted(true);
      toast.success('Refund request submitted successfully!');
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error('Failed to submit refund request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateEmailContent = () => {
    const selectedReason = REFUND_REASONS.find(r => r.id === refundRequest.category);
    
    return `REFUND REQUEST

User Information:
- Name: ${user?.name || 'Not provided'}
- Email: ${user?.email || 'Not provided'}
- User ID: ${user?.id || 'Not provided'}

Request Details:
- Category: ${selectedReason?.label || 'Not specified'}
- Reason: ${selectedReason?.description || 'Not specified'}
- Urgency: ${refundRequest.urgency.toUpperCase()}
- Preferred Contact: ${refundRequest.contactPreference.toUpperCase()}

Bill Information:
${refundRequest.billId ? `- Bill ID: ${refundRequest.billId}` : '- Bill ID: Not specified'}
${refundRequest.billTitle ? `- Bill Title: ${refundRequest.billTitle}` : '- Bill Title: Not specified'}
${refundRequest.amount ? `- Amount: $${refundRequest.amount.toFixed(2)}` : '- Amount: Not specified'}
${refundRequest.paymentDate ? `- Payment Date: ${refundRequest.paymentDate}` : '- Payment Date: Not specified'}

Detailed Description:
${refundRequest.description}

---
This request was submitted on ${new Date().toLocaleString()} via the GradHelper platform.

Please process this refund request and contact the user via their preferred method within 2-3 business days.
`;
  };

  const resetModal = () => {
    setStep(1);
    setRefundRequest({
      reason: '',
      category: '',
      description: '',
      contactPreference: 'email',
      urgency: 'medium'
    });
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your refund request has been submitted successfully. Our support team will review your request and contact you within 2-3 business days.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
                <br />• Check your email for a confirmation
                <br />• Our team will investigate your request
                <br />• You'll receive updates on the status
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Refund Request</h2>
              <p className="text-sm text-gray-600">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Refund Category</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please select the reason for your refund request:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {REFUND_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => handleInputChange('category', reason.id)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        refundRequest.category === reason.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{reason.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{reason.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={refundRequest.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Standard request</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!refundRequest.category}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Request Details</h3>
                
                {/* Bill Information (Optional) */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Bill Information (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bill ID or Task Title
                      </label>
                      <input
                        type="text"
                        value={refundRequest.billTitle || ''}
                        onChange={(e) => handleInputChange('billTitle', e.target.value)}
                        placeholder="e.g., Data Science Assignment"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount Paid
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={refundRequest.amount || ''}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={refundRequest.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please provide a detailed explanation of your refund request. Include specific issues, dates, and any relevant information that will help us process your request."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 50 characters. Be specific to help us process your request faster.
                  </p>
                </div>

                {/* Contact Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={refundRequest.contactPreference === 'email'}
                        onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                        className="mr-2"
                      />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        checked={refundRequest.contactPreference === 'phone'}
                        onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                        className="mr-2"
                      />
                      Phone
                    </label>
                  </div>
                </div>

                {/* Warning Notice */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Important Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Refund requests are reviewed on a case-by-case basis. Processing typically takes 3-5 business days. 
                        Approved refunds will be credited back to your original payment method within 7-10 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !refundRequest.description.trim() || refundRequest.description.length < 50}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}