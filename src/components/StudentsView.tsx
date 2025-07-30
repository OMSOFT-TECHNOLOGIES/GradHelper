import { MessageCircle, Star } from 'lucide-react';

export function StudentsView() {
  const mockStudents = [
    {
      id: 1,
      name: "John Smith",
      email: "john@university.edu",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      activeTasks: 2,
      completedTasks: 5,
      totalSpent: 850,
      rating: 4.8
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@university.edu",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      activeTasks: 1,
      completedTasks: 8,
      totalSpent: 1200,
      rating: 4.9
    }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Students</h2>
          <p className="card-description">Manage student accounts and performance</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {mockStudents.map((student) => (
              <div key={student.id} className="student-item">
                <div className="student-header">
                  <div className="student-info">
                    <div className="avatar w-10 h-10">
                      <img src={student.avatar} alt={student.name} />
                    </div>
                    <div className="student-details">
                      <h4>{student.name}</h4>
                      <p className="student-email">{student.email}</p>
                    </div>
                  </div>
                  <div className="student-stats">
                    <div className="student-stats-row">
                      <span>{student.activeTasks} active</span>
                      <span>{student.completedTasks} completed</span>
                      <span>${student.totalSpent} total</span>
                      <div className="flex items-center gap-1">
                        <Star className="star" />
                        <span>{student.rating}</span>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button className="btn btn-outline btn-sm">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <button className="btn btn-outline btn-sm">View Tasks</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}