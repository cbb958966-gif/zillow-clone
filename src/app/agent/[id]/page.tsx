'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

interface Agent {
  id: string;
  license: string | null;
  broker: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  specialties: string | null;
  experience: number | null;
  commissionRate: number | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  properties: Array<{
    id: string;
    title: string;
    price: number;
    address: string;
    city: string;
    state: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    images: Array<{
      id: string;
      url: string;
      isPrimary: boolean;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  }>;
  _count: {
    properties: number;
    reviews: number;
  };
}

export default function AgentProfile() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchAgent();
    }
  }, [params.id]);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/agents/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewForm),
      });

      if (response.ok) {
        setReviewForm({ rating: 5, comment: '' });
        fetchAgent(); // Refresh agent data
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      alert('An error occurred while submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'button'}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center pt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h2>
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Back to Home
            </a>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const averageRating = agent.reviews.length > 0 
    ? agent.reviews.reduce((sum, review) => sum + review.rating, 0) / agent.reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="surface-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-600">
                {agent.user.firstName?.[0]}{agent.user.lastName?.[0]}
              </span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {agent.user.firstName} {agent.user.lastName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{agent.broker}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">License:</span>
                  <span className="ml-2 font-medium">{agent.license || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{agent.email || agent.user.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{agent.phone || agent.user.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Experience:</span>
                  <span className="ml-2 font-medium">{agent.experience || 0} years</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-gray-600 mb-1">
                {averageRating.toFixed(1)} out of 5
              </p>
              <p className="text-sm text-gray-500">
                {agent._count.reviews} reviews
              </p>
              
              <div className="mt-4 space-y-2">
                <a
                  href={`tel:${agent.phone || agent.user.phone}`}
                  className="btn-smooth block px-4 py-2 text-center"
                >
                  Call Agent
                </a>
                <a
                  href={`mailto:${agent.email || agent.user.email}`}
                  className="btn-quiet block px-4 py-2 text-center"
                >
                  Email Agent
                </a>
              </div>
            </div>
          </div>

          {agent.bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{agent.bio}</p>
            </div>
          )}

          {agent.specialties && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.split(',').map((specialty, index) => (
                  <span
                    key={index}
                    className="pill"
                  >
                    {specialty.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{agent._count.properties}</div>
              <div className="text-sm text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{agent._count.reviews}</div>
              <div className="text-sm text-gray-600">Client Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{agent.experience || 0}</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {agent.commissionRate ? `${agent.commissionRate}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Commission Rate</div>
            </div>
          </div>
        </div>

        <div className="surface-card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties ({agent._count.properties})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({agent._count.reviews})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'properties' && (
              <div>
                {agent.properties.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No properties listed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agent.properties.map((property) => {
                      const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
                      
                      return (
                        <a
                          key={property.id}
                          href={`/property/${property.id}`}
                          className="block surface-card surface-card-hover overflow-hidden"
                        >
                          <div className="relative h-48 bg-gray-200">
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-4xl">🏠</div>
                              </div>
                            )}
                            <div className="pill absolute bottom-2 left-2 bg-primary text-primary-foreground">
                              ${property.price.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {property.address}, {property.city}, {property.state}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {property.beds && <span>{property.beds} beds</span>}
                              {property.baths && <span>{Math.floor(property.baths)} baths</span>}
                              {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="surface-card mb-8 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm({ ...reviewForm, rating })
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment
                      </label>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience working with this agent..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-smooth px-4 py-2 disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {agent.reviews.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No reviews yet.</p>
                ) : (
                  <div className="space-y-6">
                    {agent.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {review.user.firstName} {review.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}