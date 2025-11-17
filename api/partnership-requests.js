/**
 * Partnership Requests API Endpoints
 * 
 * Provides RESTful API endpoints for managing partnership applications
 * with proper authentication, validation, and error handling
 */

// Mock database - In production, replace with actual database
let partnershipRequests = [];
let partnershipData = {};
let nextRequestId = 1;

// Helper function to validate user role
const validateUserRole = (req, requiredRole) => {
  const userRole = req.headers['x-user-role'] || req.body.userRole;
  if (requiredRole === 'admin' && userRole !== 'admin') {
    throw new Error('Admin access required');
  }
  if (requiredRole === 'student' && userRole !== 'student') {
    throw new Error('Student access required');
  }
  return true;
};

// Helper function to get user ID from request
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.body.userId || req.query.userId;
};

// Helper function to validate request data
const validatePartnershipRequest = (data) => {
  const errors = [];
  
  if (!data.school?.trim()) {
    errors.push('School name is required');
  }
  
  if (!data.year?.trim()) {
    errors.push('Year of study is required');
  }
  
  if (!data.course?.trim()) {
    errors.push('Course/Major is required');
  }
  
  if (!data.motivation?.trim()) {
    errors.push('Motivation is required');
  } else if (data.motivation.trim().length < 50) {
    errors.push('Motivation must be at least 50 characters');
  } else if (data.motivation.trim().length > 1000) {
    errors.push('Motivation cannot exceed 1000 characters');
  }
  
  if (data.experience && data.experience.length > 500) {
    errors.push('Experience cannot exceed 500 characters');
  }
  
  return errors;
};

// Helper function to generate referral code
const generateReferralCode = (userName) => {
  const sanitizedName = userName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .substring(0, 10);
  
  const timestamp = Date.now().toString().slice(-6);
  return `GRAD-${sanitizedName}-${timestamp}`;
};

/**
 * POST /api/partnership-requests
 * Submit partnership request (Student only)
 */
export const createPartnershipRequest = async (req, res) => {
  try {
    // Validate user role
    validateUserRole(req, 'student');
    
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Validate request data
    const validationErrors = validatePartnershipRequest(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        code: 'VALIDATION_FAILED'
      });
    }

    // Check for existing pending or approved application
    const existingRequest = partnershipRequests.find(
      req => req.userId === userId && (req.status === 'pending' || req.status === 'approved')
    );
    
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending or approved partnership application',
        code: 'DUPLICATE_APPLICATION'
      });
    }

    // Create new partnership request
    const newRequest = {
      id: nextRequestId++,
      userId: userId,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userAvatar: req.body.userAvatar || '',
      school: req.body.school.trim(),
      year: req.body.year.trim(),
      course: req.body.course.trim(),
      motivation: req.body.motivation.trim(),
      experience: req.body.experience?.trim() || '',
      socialMedia: req.body.socialMedia?.trim() || '',
      status: 'pending',
      submittedDate: new Date().toISOString(),
      referralCode: generateReferralCode(req.body.userName)
    };

    partnershipRequests.push(newRequest);

    // Create partnership data entry
    partnershipData[userId] = {
      isPartner: true,
      status: 'pending',
      school: newRequest.school,
      referralCode: newRequest.referralCode,
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      joinedDate: newRequest.submittedDate.split('T')[0],
      applicationData: newRequest
    };

    res.status(201).json({
      success: true,
      message: 'Partnership application submitted successfully',
      data: {
        request: newRequest,
        partnershipData: partnershipData[userId]
      }
    });

  } catch (error) {
    console.error('Error creating partnership request:', error);
    
    if (error.message === 'Admin access required' || error.message === 'Student access required') {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit partnership application',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * GET /api/partnership-requests
 * Get partnership requests (Admin only)
 */
export const getPartnershipRequests = async (req, res) => {
  try {
    // Validate admin role
    validateUserRole(req, 'admin');

    const {
      status,
      search,
      sortBy = 'submittedDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let filteredRequests = [...partnershipRequests];

    // Filter by status
    if (status && status !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRequests = filteredRequests.filter(req =>
        req.userName.toLowerCase().includes(searchLower) ||
        req.school.toLowerCase().includes(searchLower) ||
        req.userEmail.toLowerCase().includes(searchLower) ||
        req.course.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    filteredRequests.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.userName;
          bValue = b.userName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'submittedDate':
        default:
          aValue = a.submittedDate;
          bValue = b.submittedDate;
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    // Calculate statistics
    const statistics = {
      total: partnershipRequests.length,
      pending: partnershipRequests.filter(r => r.status === 'pending').length,
      approved: partnershipRequests.filter(r => r.status === 'approved').length,
      rejected: partnershipRequests.filter(r => r.status === 'rejected').length,
      filteredTotal: filteredRequests.length
    };

    res.json({
      success: true,
      data: {
        requests: paginatedRequests,
        statistics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredRequests.length,
          totalPages: Math.ceil(filteredRequests.length / parseInt(limit)),
          hasNext: endIndex < filteredRequests.length,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching partnership requests:', error);
    
    if (error.message === 'Admin access required') {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch partnership requests',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * GET /api/partnership-requests/:requestId
 * Get specific partnership request details
 */
export const getPartnershipRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = getUserId(req);

    const request = partnershipRequests.find(r => r.id === parseInt(requestId));
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    // Check if user can access this request
    const userRole = req.headers['x-user-role'] || req.query.userRole;
    if (userRole !== 'admin' && request.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: 'UNAUTHORIZED'
      });
    }

    // Include partnership data for the user
    const userPartnershipData = partnershipData[request.userId];

    res.json({
      success: true,
      data: {
        request,
        partnershipData: userPartnershipData
      }
    });

  } catch (error) {
    console.error('Error fetching partnership request:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partnership request',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * PUT /api/partnership-requests/:requestId/status
 * Update partnership request status (Admin only)
 */
export const updatePartnershipRequestStatus = async (req, res) => {
  try {
    // Validate admin role
    validateUserRole(req, 'admin');

    const { requestId } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
        code: 'INVALID_STATUS'
      });
    }

    if (status === 'rejected' && !rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a request',
        code: 'MISSING_REJECTION_REASON'
      });
    }

    const requestIndex = partnershipRequests.findIndex(r => r.id === parseInt(requestId));
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    const request = partnershipRequests[requestIndex];

    // Update request
    const updatedRequest = {
      ...request,
      status,
      reviewedDate: new Date().toISOString(),
      reviewedBy: reviewedBy || 'Admin',
      ...(status === 'rejected' && { rejectionReason: rejectionReason.trim() })
    };

    partnershipRequests[requestIndex] = updatedRequest;

    // Update partnership data
    const userPartnershipData = {
      isPartner: status === 'approved',
      status,
      school: status === 'approved' ? request.school : '',
      referralCode: status === 'approved' ? request.referralCode : '',
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      joinedDate: status === 'approved' ? request.submittedDate.split('T')[0] : '',
      applicationData: updatedRequest,
      ...(status === 'rejected' && { rejectionReason: rejectionReason.trim() })
    };

    partnershipData[request.userId] = userPartnershipData;

    // Generate notification data
    const notifications = [];
    
    if (status === 'approved') {
      notifications.push({
        type: 'system',
        title: 'Partnership Application Approved! 🎉',
        message: `Congratulations! You are now an official TheGradHelper representative at ${request.school}. Your referral code is: ${request.referralCode}`,
        userId: request.userId,
        userRole: 'student',
        data: {
          type: 'partnership_approved',
          school: request.school,
          referralCode: request.referralCode
        }
      });
    } else {
      notifications.push({
        type: 'system',
        title: 'Partnership Application Update',
        message: `Your partnership application for ${request.school} has been reviewed. Please check your partnership page for details.`,
        userId: request.userId,
        userRole: 'student',
        data: {
          type: 'partnership_rejected',
          reason: rejectionReason.trim()
        }
      });
    }

    res.json({
      success: true,
      message: `Partnership request ${status} successfully`,
      data: {
        request: updatedRequest,
        partnershipData: userPartnershipData,
        notifications
      }
    });

  } catch (error) {
    console.error('Error updating partnership request status:', error);
    
    if (error.message === 'Admin access required') {
      return res.status(403).json({
        success: false,
        message: error.message,
        code: 'UNAUTHORIZED'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update partnership request status',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * DELETE /api/partnership-requests/:requestId
 * Cancel partnership request
 */
export const cancelPartnershipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const requestIndex = partnershipRequests.findIndex(r => r.id === parseInt(requestId));
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Partnership request not found',
        code: 'REQUEST_NOT_FOUND'
      });
    }

    const request = partnershipRequests[requestIndex];

    // Check if user owns this request or is admin
    const userRole = req.headers['x-user-role'] || req.body.userRole;
    if (userRole !== 'admin' && request.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own partnership requests',
        code: 'UNAUTHORIZED'
      });
    }

    // Only allow cancellation of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled',
        code: 'INVALID_OPERATION'
      });
    }

    // Mark request as cancelled instead of deleting
    const cancelledRequest = {
      ...request,
      status: 'cancelled',
      cancelledDate: new Date().toISOString(),
      cancelledBy: userId
    };

    partnershipRequests[requestIndex] = cancelledRequest;

    // Update partnership data
    if (partnershipData[request.userId]) {
      partnershipData[request.userId] = {
        ...partnershipData[request.userId],
        isPartner: false,
        status: 'cancelled'
      };
    }

    res.json({
      success: true,
      message: 'Partnership request cancelled successfully',
      data: {
        request: cancelledRequest
      }
    });

  } catch (error) {
    console.error('Error cancelling partnership request:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to cancel partnership request',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * GET /api/partnership-requests/user/:userId
 * Get partnership requests for a specific user
 */
export const getUserPartnershipRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = getUserId(req);
    const userRole = req.headers['x-user-role'] || req.query.userRole;

    // Check if user can access this data
    if (userRole !== 'admin' && requesterId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: 'UNAUTHORIZED'
      });
    }

    const userRequests = partnershipRequests.filter(r => r.userId === userId);
    const userPartnershipData = partnershipData[userId];

    res.json({
      success: true,
      data: {
        requests: userRequests,
        partnershipData: userPartnershipData,
        statistics: {
          total: userRequests.length,
          pending: userRequests.filter(r => r.status === 'pending').length,
          approved: userRequests.filter(r => r.status === 'approved').length,
          rejected: userRequests.filter(r => r.status === 'rejected').length,
          cancelled: userRequests.filter(r => r.status === 'cancelled').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user partnership requests:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user partnership requests',
      code: 'SERVER_ERROR'
    });
  }
};

// Export all endpoints
export default {
  createPartnershipRequest,
  getPartnershipRequests,
  getPartnershipRequestById,
  updatePartnershipRequestStatus,
  cancelPartnershipRequest,
  getUserPartnershipRequests
};