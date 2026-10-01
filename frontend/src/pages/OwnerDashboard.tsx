import React, { useEffect, useState } from 'react';
import { Store, Star, LogOut, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import api from '../api/client';

interface DashboardData {
  store: {
    id: number;
    name: string;
    address: string;
    average_rating: string;
  };
  ratings: Array<{
    id: number;
    name: string;
    email: string;
    rating: number;
    review_text?: string;
    rated_at: string;
  }>;
  photos: Array<{
    id: number;
    image_data: string;
    image_mime_type: string;
  }>;
}

const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/owner/dashboard');
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !data) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      await api.post(`/stores/${data.store.id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { name: 'User Name', selector: (row: any) => row.name, sortable: true },
    { name: 'Email', selector: (row: any) => row.email, sortable: true },
    { name: 'Rating', selector: (row: any) => row.rating, sortable: true, cell: (row: any) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
        <Star size={14} fill="#F59E0B" color="#F59E0B" /> {row.rating}
      </span>
    )},
    { name: 'Review', selector: (row: any) => row.review_text || 'No review text', wrap: true },
    { name: 'Date', selector: (row: any) => new Date(row.rated_at).toLocaleDateString(), sortable: true },
  ];

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}>Loading Dashboard...</div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <header style={{ backgroundColor: 'var(--surface-color)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Store Owner Portal</h2>
        <button onClick={handleLogout} className="btn btn-outline"><LogOut size={16} /> Logout</button>
      </header>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        {!data ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16 }}>Welcome!</h3>
            <p style={{ color: 'var(--text-muted)' }}>An administrator needs to assign a store to your account before you can view your dashboard.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'inline-flex', padding: 16, backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: 16 }}><Store size={32} /></div>
                <h3 style={{ fontSize: '2rem', marginBottom: 8 }}>{data.store.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{data.store.address}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem', fontWeight: 600 }}>
                  <Star size={24} fill="#F59E0B" color="#F59E0B" /> 
                  {data.store.average_rating} Average Rating
                </div>
              </div>

              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={20} /> Store Photos</h3>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
                  {data.photos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No photos uploaded yet.</p>
                  ) : (
                    data.photos.map(photo => (
                      <img 
                        key={photo.id} 
                        src={`data:${photo.image_mime_type};base64,${photo.image_data}`} 
                        alt="Store" 
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      />
                    ))
                  )}
                </div>
                <div>
                  <input type="file" id="upload-photo" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                  <label htmlFor="upload-photo" className="btn btn-outline" style={{ display: 'inline-flex' }}>
                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload New Photo'}
                  </label>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 24 }}>Customer Ratings & Reviews</h3>
              <DataTable columns={columns} data={data.ratings} pagination responsive highlightOnHover />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;
