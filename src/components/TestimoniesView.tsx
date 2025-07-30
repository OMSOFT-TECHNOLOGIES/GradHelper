import { Plus, Star } from 'lucide-react';

export function TestimoniesView() {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Testimonies</h2>
          <p className="card-description">Manage student testimonials and reviews</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="testimony-item">
              <div className="testimony-header">
                <div className="flex-1">
                  <div className="testimony-user">
                    <div className="avatar w-8 h-8">
                      <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" alt="Sarah Johnson" />
                    </div>
                    <div className="testimony-user-details">
                      <p className="testimony-user-name">Sarah Johnson</p>
                      <div className="star-rating">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="star" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="testimony-text">
                    "TheGradHelper has been instrumental in helping me complete my final year project. 
                    The quality of work and support provided is exceptional."
                  </p>
                </div>
                <span className="badge badge-success">Published</span>
              </div>
            </div>
            <button className="btn btn-primary w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Testimony
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}