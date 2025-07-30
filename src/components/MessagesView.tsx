import { MessageCircle } from 'lucide-react';

interface MessagesViewProps {
  userRole: 'student' | 'admin';
}

export function MessagesView({ userRole }: MessagesViewProps) {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Messages</h2>
          <p className="card-description">
            Communicate with {userRole === 'student' ? 'admin and support' : 'students'}
          </p>
        </div>
        <div className="card-content">
          <div className="message-list">
            <div className="message-item">
              <div className="avatar w-10 h-10">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="Admin" />
              </div>
              <div className="message-content">
                <div className="message-header">
                  <h4>
                    {userRole === 'student' ? 'Admin Support' : 'John Smith'}
                  </h4>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <p className="message-text">
                  Your ML research paper deliverable has been approved...
                </p>
              </div>
              <button className="btn btn-outline btn-sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}