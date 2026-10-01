import React, { useEffect, useState } from 'react';
import { Search, Star, LogOut, Upload, X, ImageIcon, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Store {
  store_id: number;
  store_name: string;
  address: string;
  overall_rating: number;
  user_submitted_rating: number | null;
}

interface StoreDetails {
  store: { id: number; name: string; address: string; average_rating: string; };
  photos: Array<{ id: number; image_data: string; image_mime_type: string; }>;
  reviews: Array<{ id: number; user_name: string; rating: number; review_text: string; updated_at: string; }>;
}

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedStore, setSelectedStore] = useState<StoreDetails | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Rating states
  const [ratingVal, setRatingVal] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores', { params: { search } });
      setStores(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchStores(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenStore = async (storeId: number) => {
    try {
      const res = await api.get(`/stores/${storeId}`);
      setSelectedStore(res.data);
      // Reset rating form for this store
      const storeInList = stores.find(s => s.store_id === storeId);
      setRatingVal(storeInList?.user_submitted_rating || 0);
      setReviewText('');
    } catch (err) { console.error(err); }
  };

  const handleRate = async () => {
    if (!selectedStore) return;
    try {
      await api.post(`/stores/${selectedStore.store.id}/rate`, { rating: ratingVal, review_text: reviewText });
      // Refresh details
      await handleOpenStore(selectedStore.store.id);
      fetchStores(); 
    } catch (error) { console.error('Failed to rate store', error); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedStore) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    setUploading(true);
    try {
      await api.post(`/stores/${selectedStore.store.id}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleOpenStore(selectedStore.store.id); // Refresh
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to upload photo'); } 
    finally { setUploading(false); }
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <header style={{ backgroundColor: 'var(--surface-color)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Store Explorer</h2>
        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 16px' }}><LogOut size={16} /> Logout</button>
      </header>

      <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto 40px auto' }}>
          <Search size={20} style={{ position: 'absolute', top: 14, left: 16, color: 'var(--text-light)' }} />
          <input
            type="text" className="form-control" style={{ paddingLeft: 48, borderRadius: 24, fontSize: '1.1rem' }}
            placeholder="Search stores by Name or Address..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? ( <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading stores...</p> ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {stores.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No stores found.</p>
            ) : (
              stores.map((store) => (
                <div key={store.store_id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => handleOpenStore(store.store_id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{store.store_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>
                      <Star size={14} fill="currentColor" style={{ marginRight: 4 }} />
                      {store.overall_rating}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, flexGrow: 1 }}>{store.address}</p>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', alignItems: 'center', color: 'var(--accent-color)', fontWeight: 500, fontSize: '0.9rem' }}>
                    <Info size={16} style={{ marginRight: 6 }} /> View Details & Reviews
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {selectedStore && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2>{selectedStore.store.name}</h2>
              <X size={24} style={{ cursor: 'pointer', color: 'var(--text-light)' }} onClick={() => setSelectedStore(null)} />
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{selectedStore.store.address}</p>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {/* Left Column: Photos */}
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={18} /> Store Photos</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
                  {selectedStore.photos.map(photo => (
                    <img key={photo.id} src={`data:${photo.image_mime_type};base64,${photo.image_data}`} alt="Store" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                  ))}
                  {selectedStore.photos.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', gridColumn: '1 / -1' }}>No photos uploaded yet.</p>}
                </div>
                
                <input type="file" id="upload-user-photo" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                <label htmlFor="upload-user-photo" className="btn btn-outline" style={{ display: 'inline-flex', width: '100%' }}>
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload a Photo'}
                </label>
              </div>

              {/* Right Column: Rate & Reviews */}
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ padding: 20, backgroundColor: 'var(--primary-light)', borderRadius: 12, marginBottom: 24 }}>
                  <h4 style={{ marginBottom: 12 }}>Submit a Review</h4>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star} onClick={() => setRatingVal(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: ratingVal >= star ? 'var(--warning-color)' : '#CBD5E1', transition: 'color 0.2s' }}
                      >
                        <Star size={28} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="form-control" style={{ minHeight: 80, resize: 'none', marginBottom: 12 }} placeholder="Write your review here... (optional)"
                    value={reviewText} onChange={e => setReviewText(e.target.value)}
                  />
                  <button onClick={handleRate} className="btn btn-primary" style={{ width: '100%' }} disabled={ratingVal === 0}>Submit Rating</button>
                </div>

                <h4 style={{ marginBottom: 16 }}>Recent Reviews</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {selectedStore.reviews.length === 0 && <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>No reviews yet.</p>}
                  {selectedStore.reviews.map(review => (
                    <div key={review.id} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong>{review.user_name}</strong>
                        <span style={{ color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                          <Star size={12} fill="currentColor" /> {review.rating}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>{review.review_text || <em>No text provided</em>}</p>
                      <small style={{ color: 'var(--text-light)' }}>{new Date(review.updated_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
