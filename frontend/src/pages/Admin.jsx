import React, { useState } from 'react';
import { Users, BookOpen, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import './Admin.css';

const MOCK_BOOKS = [
  { id: '1', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Thriller', reads: 1245 },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', reads: 8432 },
  { id: '3', title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', reads: 4561 },
];

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'User', joined: 'Oct 12, 2025' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', joined: 'Sep 05, 2025' },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1>Admin Control Panel</h1>
          <p className="text-muted">Manage the ReadSphere platform resources</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> {activeTab === 'books' ? 'Add New Book' : 'Add New User'}
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <BookOpen size={18} /> Manage Books
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Manage Users
        </button>
      </div>

      <div className="admin-content glass-panel">
        {activeTab === 'books' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Total Reads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BOOKS.map(book => (
                  <tr key={book.id}>
                    <td className="font-medium text-primary">{book.title}</td>
                    <td>{book.author}</td>
                    <td><span className="badge">{book.category}</span></td>
                    <td>{book.reads.toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn-small" title="Edit"><Edit2 size={16} /></button>
                        <button className="icon-btn-small danger" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(user => (
                  <tr key={user.id}>
                    <td className="font-medium text-primary">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'Admin' ? 'badge-primary' : ''}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.joined}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn-small" title="Edit"><Edit2 size={16} /></button>
                        <button className="icon-btn-small danger" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
