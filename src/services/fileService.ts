// File Service for downloading and viewing files
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface FileItem {
  id: string;
  name: string;
  url?: string;
  size: number;
  type: string;
  mimeType?: string;
  uploadedAt?: string;
  taskId?: string;
  deliverableId?: string;
}

class FileService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Get JWT token from localStorage or auth context
    const token = localStorage.getItem('gradhelper_token');
    
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Download a file by ID
   * @param fileId - The ID of the file to download
   * @param fileName - Optional filename for the download
   */
  async downloadFile(fileId: string, fileName?: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `file_${fileId}`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get file preview URL
   * @param fileId - The ID of the file to preview
   */
  getFilePreviewUrl(fileId: string): string {
    return `${API_BASE_URL}/files/preview/${fileId}`;
  }

  /**
   * Get direct file URL
   * @param fileId - The ID of the file
   */
  getFileUrl(fileId: string): string {
    return `${API_BASE_URL}/files/${fileId}`;
  }

  /**
   * Check if file type can be previewed in browser
   * @param fileName - The name of the file
   * @param mimeType - Optional MIME type
   */
  canPreviewFile(fileName: string, mimeType?: string): boolean {
    if (!fileName || typeof fileName !== 'string') {
      return false;
    }
    const extension = fileName.split('.').pop()?.toLowerCase();
    const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'txt', 'md'];
    const previewableMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/markdown'
    ];

    return Boolean(
      (extension && previewableExtensions.includes(extension)) ||
      (mimeType && previewableMimeTypes.includes(mimeType))
    );
  }

  /**
   * Get file type icon class based on file extension
   * @param fileName - The name of the file
   */
  getFileTypeClass(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return 'file-type-default';
    }
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'file-type-pdf';
      case 'doc':
      case 'docx':
        return 'file-type-doc';
      case 'xls':
      case 'xlsx':
        return 'file-type-excel';
      case 'ppt':
      case 'pptx':
        return 'file-type-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'file-type-image';
      case 'zip':
      case 'rar':
      case '7z':
        return 'file-type-archive';
      case 'txt':
      case 'md':
        return 'file-type-text';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'file-type-video';
      case 'mp3':
      case 'wav':
      case 'flac':
        return 'file-type-audio';
      default:
        return 'file-type-default';
    }
  }

  /**
   * Format file size in human readable format
   * @param bytes - Size in bytes
   */
  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Upload files to a task or deliverable
   * @param files - Array of File objects to upload
   * @param taskId - Optional task ID
   * @param deliverableId - Optional deliverable ID
   */
  async uploadFiles(
    files: File[], 
    taskId?: string, 
    deliverableId?: string
  ): Promise<{ success: boolean; data: FileItem[] }> {
    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      if (taskId) formData.append('taskId', taskId);
      if (deliverableId) formData.append('deliverableId', deliverableId);

      const headers = await this.getAuthHeaders();
      // Remove Content-Type for FormData - browser sets it with boundary
      const { 'Content-Type': _, ...headersWithoutContentType } = headers as any;

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   * @param fileId - The ID of the file to delete
   */
  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const fileService = new FileService();

// Helper functions for file handling
export const downloadFileHelper = async (file: FileItem, context?: string) => {
  try {
    if (file.url && file.url.startsWith('http')) {
      // Direct URL - open in new tab
      window.open(file.url, '_blank');
    } else {
      // Use file service to download
      await fileService.downloadFile(file.id, file.name);
    }
  } catch (error) {
    console.error('Failed to download file:', error);
    throw new Error('Failed to download file. Please try again.');
  }
};

export const previewFileHelper = (file: FileItem) => {
  if (file.url && file.url.startsWith('http')) {
    window.open(file.url, '_blank');
  } else if (file.name && fileService.canPreviewFile(file.name, file.mimeType)) {
    window.open(fileService.getFilePreviewUrl(file.id), '_blank');
  } else {
    // If can't preview, download instead
    downloadFileHelper(file);
  }
};