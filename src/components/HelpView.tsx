export function HelpView() {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Help Requests</h2>
          <p className="card-description">Student support tickets and requests</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="help-item">
              <div className="help-header">
                <div className="flex-1">
                  <div className="help-user">
                    <div className="avatar w-8 h-8">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="John Smith" />
                    </div>
                    <div className="help-user-details">
                      <p className="help-user-name">John Smith</p>
                      <p className="help-timestamp">2 hours ago</p>
                    </div>
                  </div>
                  <h4 className="help-title">Issue with deliverable submission</h4>
                  <p className="help-description">
                    I'm having trouble uploading my methodology section. The file seems too large...
                  </p>
                </div>
                <div className="help-actions">
                  <span className="badge badge-error">High Priority</span>
                  <button className="btn btn-sm btn-primary">Respond</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}