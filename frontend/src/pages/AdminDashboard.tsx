import React, { useEffect, useState } from 'react';
import { Users, Store, Star, LogOut, Search, Plus, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import api from '../api/client';

interface Stats {
  total_users: string;
  total_stores: string;
  total_ratings: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  store_rating?: string | number | null;
}

interface StoreData {
  id: number;
  name: string;
  email: string;
  address: string;
  average_rating: string | number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<StoreData[]>([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'stores'>('stats');
  const navigate = useNavigate();

  // Filter States
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Form States
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_email: '' });

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.name) params.append('name', userFilters.name);
      if (userFilters.email) params.append('email', userFilters.email);
      if (userFilters.address) params.append('address', userFilters.address);
      if (userFilters.role) params.append('role', userFilters.role);
      
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (storeFilters.name) params.append('name', storeFilters.name);
      if (storeFilters.email) params.append('email', storeFilters.email);
      if (storeFilters.address) params.append('address', storeFilters.address);

      const res = await api.get(`/admin/stores?${params.toString()}`);
      setStores(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchStats(); }, []);
  
  // Debounce filters
  useEffect(() => { 
    const t = setTimeout(fetchUsers, 300); 
    return () => clearTimeout(t); 
  }, [userFilters]);

  useEffect(() => { 
    const t = setTimeout(fetchStores, 300); 
    return () => clearTimeout(t); 
  }, [storeFilters]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setShowUserModal(false);
      fetchUsers();
      fetchStats();
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
    } catch (err: any) { alert(err.response?.data?.error || 'Error creating user'); }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/stores', newStore);
      setShowStoreModal(false);
      fetchStores();
      fetchStats();
      setNewStore({ name: '', email: '', address: '', owner_email: '' });
    } catch (err: any) { alert(err.response?.data?.error || 'Error creating store'); }
  };

  const handleViewUser = async (id: number) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setViewUser(res.data);
    } catch (err) { console.error(err); }
  };

  const userColumns = [
    { name: 'Name', selector: (row: User) => row.name, sortable: true },
    { name: 'Email', selector: (row: User) => row.email, sortable: true },
    { name: 'Role', selector: (row: User) => row.role, sortable: true, cell: (row: User) => (
        <span style={{ 
          padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600,
          backgroundColor: row.role === 'ADMIN' ? '#FEE2E2' : row.role === 'STORE_OWNER' ? '#FEF3C7' : 'var(--primary-light)',
          color: row.role === 'ADMIN' ? '#991B1B' : row.role === 'STORE_OWNER' ? '#92400E' : 'var(--primary-color)'
        }}>{row.role}</span>
    )},
    { name: 'Address', selector: (row: User) => row.address, sortable: true, wrap: true },
    { name: 'Actions', cell: (row: User) => (
      <button onClick={() => handleViewUser(row.id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
        <Eye size={14} /> View Details
      </button>
    )}
  ];

  const storeColumns = [
    { name: 'Store Name', selector: (row: StoreData) => row.name, sortable: true },
    { name: 'Email', selector: (row: StoreData) => row.email, sortable: true },
    { name: 'Address', selector: (row: StoreData) => row.address, sortable: true, wrap: true },
    { name: 'Avg Rating', selector: (row: StoreData) => row.average_rating, sortable: true, cell: (row: StoreData) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
        <Star size={14} fill="#F59E0B" color="#F59E0B" /> {row.average_rating}
      </span>
    )},
  ];

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <header style={{ backgroundColor: 'var(--surface-color)', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>Admin Portal</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => setActiveTab('stats')} className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}>Overview</button>
          <button onClick={() => setActiveTab('users')} className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}>Manage Users</button>
          <button onClick={() => setActiveTab('stores')} className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-outline'}`}>Manage Stores</button>
          <button onClick={handleLogout} className="btn btn-outline"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
        
        {/* STATS TAB */}
        {activeTab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: 16, backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: 16 }}><Users size={32} /></div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: 8 }}>{stats.total_users}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Registered Users</p>
            </div>
            
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: 16, backgroundColor: '#FEF3C7', borderRadius: '50%', color: 'var(--warning-color)', marginBottom: 16 }}><Store size={32} /></div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: 8 }}>{stats.total_stores}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Active Stores</p>
            </div>

            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: 16, backgroundColor: '#D1FAE5', borderRadius: '50%', color: 'var(--success-color)', marginBottom: 16 }}><Star size={32} /></div>
              <h3 style={{ fontSize: '2.5rem', marginBottom: 8 }}>{stats.total_ratings}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Total Ratings Submitted</p>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3>User Directory</h3>
              <button onClick={() => setShowUserModal(true)} className="btn btn-primary"><Plus size={16} /> Add User</button>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Filter by Name" className="form-control" style={{ flex: 1, minWidth: 200 }} value={userFilters.name} onChange={e => setUserFilters({...userFilters, name: e.target.value})} />
              <input type="text" placeholder="Filter by Email" className="form-control" style={{ flex: 1, minWidth: 200 }} value={userFilters.email} onChange={e => setUserFilters({...userFilters, email: e.target.value})} />
              <input type="text" placeholder="Filter by Address" className="form-control" style={{ flex: 1, minWidth: 200 }} value={userFilters.address} onChange={e => setUserFilters({...userFilters, address: e.target.value})} />
              <select className="form-control" style={{ flex: 1, minWidth: 200 }} value={userFilters.role} onChange={e => setUserFilters({...userFilters, role: e.target.value})}>
                <option value="">All Roles</option>
                <option value="USER">Normal User</option>
                <option value="ADMIN">Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            <DataTable columns={userColumns} data={users} pagination responsive highlightOnHover />
          </div>
        )}

        {/* STORES TAB */}
        {activeTab === 'stores' && (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3>Store Directory</h3>
              <button onClick={() => setShowStoreModal(true)} className="btn btn-primary"><Plus size={16} /> Add Store</button>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Filter by Name" className="form-control" style={{ flex: 1, minWidth: 200 }} value={storeFilters.name} onChange={e => setStoreFilters({...storeFilters, name: e.target.value})} />
              <input type="text" placeholder="Filter by Email" className="form-control" style={{ flex: 1, minWidth: 200 }} value={storeFilters.email} onChange={e => setStoreFilters({...storeFilters, email: e.target.value})} />
              <input type="text" placeholder="Filter by Address" className="form-control" style={{ flex: 1, minWidth: 200 }} value={storeFilters.address} onChange={e => setStoreFilters({...storeFilters, address: e.target.value})} />
            </div>

            <DataTable columns={storeColumns} data={stores} pagination responsive highlightOnHover />
          </div>
        )}
      </main>

      {/* CREATE USER MODAL */}
      {showUserModal && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3>Create New User</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowUserModal(false)} />
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group"><input required type="text" placeholder="Full Name (Min 20 chars)" className="form-control" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} /></div>
              <div className="form-group"><input required type="email" placeholder="Email Address" className="form-control" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} /></div>
              <div className="form-group"><input required type="password" placeholder="Password (8-16 chars, 1 uppercase, 1 special)" className="form-control" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} /></div>
              <div className="form-group"><textarea required placeholder="Address" className="form-control" style={{ resize: 'none', height: 80 }} value={newUser.address} onChange={e=>setNewUser({...newUser, address: e.target.value})} /></div>
              <div className="form-group">
                <select className="form-control" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">System Admin</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create User</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STORE MODAL */}
      {showStoreModal && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3>Register New Store</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setShowStoreModal(false)} />
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="form-group"><input required type="text" placeholder="Store Name" className="form-control" value={newStore.name} onChange={e=>setNewStore({...newStore, name: e.target.value})} /></div>
              <div className="form-group"><input required type="email" placeholder="Store Email" className="form-control" value={newStore.email} onChange={e=>setNewStore({...newStore, email: e.target.value})} /></div>
              <div className="form-group"><input required type="email" placeholder="Owner Email Address" className="form-control" value={newStore.owner_email} onChange={e=>setNewStore({...newStore, owner_email: e.target.value})} /></div>
              <div className="form-group"><textarea required placeholder="Store Address" className="form-control" style={{ resize: 'none', height: 80 }} value={newStore.address} onChange={e=>setNewStore({...newStore, address: e.target.value})} /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Register Store</button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {viewUser && (
        <div style={modalOverlayStyle}>
          <div className="card" style={{ padding: 32, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3>User Details</h3>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setViewUser(null)} />
            </div>
            <div>
              <p><strong>Name:</strong> {viewUser.name}</p>
              <p><strong>Email:</strong> {viewUser.email}</p>
              <p><strong>Role:</strong> {viewUser.role}</p>
              <p><strong>Address:</strong> {viewUser.address}</p>
              
              {viewUser.role === 'STORE_OWNER' && (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: 'var(--primary-light)', borderRadius: 8 }}>
                  <strong>Store's Average Rating:</strong> 
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 8, gap: 4, fontWeight: 'bold' }}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" /> {viewUser.store_rating || 'No ratings yet'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
