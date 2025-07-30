import { Send } from 'lucide-react';

export function ChatView() {
  return (
    <div className="space-y-6">
      <div className="card chat-container">
        <div className="card-header">
          <h2 className="card-title">Chat with Admin</h2>
          <p className="card-description">Get real-time support and updates</p>
        </div>
        <div className="card-content flex-1 flex flex-col">
          <div className="chat-messages">
            <div className="chat-message">
              <div className="avatar w-8 h-8">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="Admin" />
              </div>
              <div className="chat-message-bubble">
                <p className="text-sm">Hello! How can I help you today?</p>
                <span className="text-xs text-muted-foreground">Admin • 10:30 AM</span>
              </div>
            </div>
            <div className="chat-message user">
              <div className="chat-message-bubble user">
                <p className="text-sm">I have questions about my ML project deliverables.</p>
                <span className="text-xs">You • 10:32 AM</span>
              </div>
              <div className="avatar w-8 h-8">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Student" />
              </div>
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Type your message..." className="input" />
            <button className="btn btn-primary">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}