import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Users, ArrowLeftRight, Search, LogOut, Plus, Bot, Library, Edit, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// 🌟 核心修改：引入 API 而不是 mockDb
import * as api from './services/api';
import { askLibrarian } from './services/aiService';
import { Book, User, BorrowRecord, BookStatus } from './types';

// --- Login Screen (保持不变) ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account === 'admin' && password === '123456') {
      onLogin();
    } else {
      alert("Invalid credentials. Try admin/123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full"><Library className="w-8 h-8 text-white" /></div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Smart Library System</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700">Account</label><input type="text" value={account} onChange={(e) => setAccount(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md" /></div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Admin Login</button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Local Database Version</p>
      </div>
    </div>
  );
};

// --- Dashboard Component (实时计算数据) ---
const Dashboard = () => {
  const [stats, setStats] = useState({ totalBooks: 0, totalUsers: 0, activeBorrows: 0, categoryData: [] as any[] });

  useEffect(() => {
    const loadData = async () => {
      const [books, users, records] = await Promise.all([
        api.fetchBooks(),
        api.fetchUsers(),
        api.fetchBorrowRecords()
      ]);
      
      // 前端计算统计数据
      const activeBorrows = records.filter(r => !r.ReturnDate).length;
      
      // 计算分类分布
      const catMap = new Map();
      books.forEach(b => {
        catMap.set(b.Category, (catMap.get(b.Category) || 0) + 1);
      });
      const categoryData = Array.from(catMap, ([name, value]) => ({ name, value }));

      setStats({
        totalBooks: books.length,
        totalUsers: users.length,
        activeBorrows,
        categoryData
      });
    };
    loadData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mr-4"><BookOpen size={24} /></div>
            <div><p className="text-sm text-slate-500">Total Books</p><h3 className="text-2xl font-bold text-slate-800">{stats.totalBooks}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg text-green-600 mr-4"><Users size={24} /></div>
            <div><p className="text-sm text-slate-500">Registered Users</p><h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600 mr-4"><ArrowLeftRight size={24} /></div>
            <div><p className="text-sm text-slate-500">Active Borrows</p><h3 className="text-2xl font-bold text-slate-800">{stats.activeBorrows}</h3></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Books by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 标记是否在编辑
  const [formData, setFormData] = useState({ BookID: '', Title: '', Author: '', Category: '', PublishYear: 2024 });

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    const data = await api.fetchBooks();
    setBooks(data);
  };

  // 点击添加按钮
  const openAddModal = () => {
    setFormData({ BookID: '', Title: '', Author: '', Category: '', PublishYear: 2024 });
    setIsEditing(false);
    setShowModal(true);
  };

  // 点击编辑按钮
  const openEditModal = (book: Book) => {
    setFormData({ 
      BookID: book.BookID, 
      Title: book.Title, 
      Author: book.Author, 
      Category: book.Category, 
      PublishYear: book.PublishYear 
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // 提交表单（新增或修改）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateBook(formData.BookID, formData);
      } else {
        await api.addBook({ ...formData, Status: BookStatus.Available });
      }
      await loadBooks();
      setShowModal(false);
    } catch (error) {
      alert("Operation failed. Check if ID exists or server error.");
    }
  };

  // 删除书籍
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.deleteBook(id);
      await loadBooks();
    } catch (err) {
      alert("Cannot delete: Book might be borrowed or have records.");
    }
  };

  const filteredBooks = books.filter(b => 
    b.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.Author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Book Inventory</h2>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredBooks.map((book) => (
              <tr key={book.BookID}>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{book.BookID}</td>
                <td className="px-6 py-4 text-sm font-medium">{book.Title}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{book.Author}</td>
                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.Status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{book.Status}</span></td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(book)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(book.BookID)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="ID" disabled={isEditing} value={formData.BookID} onChange={e => setFormData({...formData, BookID: e.target.value})} className={`border p-2 rounded ${isEditing ? 'bg-slate-100' : ''}`} />
                <input required placeholder="Year" type="number" value={formData.PublishYear} onChange={e => setFormData({...formData, PublishYear: +e.target.value})} className="border p-2 rounded" />
              </div>
              <input required placeholder="Title" value={formData.Title} onChange={e => setFormData({...formData, Title: e.target.value})} className="w-full border p-2 rounded" />
              <input required placeholder="Author" value={formData.Author} onChange={e => setFormData({...formData, Author: e.target.value})} className="w-full border p-2 rounded" />
              <input required placeholder="Category" value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})} className="w-full border p-2 rounded" />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
// --- User Management ---
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ UserID: '', Name: '', Email: '', Phone: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = async () => { setUsers(await api.fetchUsers()); };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateUser(formData.UserID, formData);
        alert("User updated successfully");
      } else {
        await api.addUser({ ...formData, RegisterDate: new Date().toISOString() });
        alert("User registered successfully");
      }
      await loadUsers();
      resetForm();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleEdit = (user: User) => {
    setFormData({ UserID: user.UserID, Name: user.Name, Email: user.Email, Phone: user.Phone });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert("Cannot delete user (Check borrow records)");
    }
  };

  const resetForm = () => {
    setFormData({ UserID: '', Name: '', Email: '', Phone: '' });
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Users Directory</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u.UserID}>
                  <td className="px-6 py-4">{u.UserID}</td>
                  <td className="px-6 py-4">{u.Name}</td>
                  <td className="px-6 py-4">{u.Email}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(u.UserID)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 右侧表单区域 */}
      <div className="lg:col-span-1">
        <div className={`p-6 rounded-xl border transition-colors ${isEditing ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{isEditing ? 'Edit User' : 'Register User'}</h3>
            {isEditing && <button onClick={resetForm} className="text-sm text-slate-500 underline">Cancel</button>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="User ID" disabled={isEditing} value={formData.UserID} onChange={e => setFormData({...formData, UserID: e.target.value})} className={`w-full border p-2 rounded ${isEditing ? 'bg-slate-200 cursor-not-allowed' : ''}`} />
            <input required placeholder="Name" value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} className="w-full border p-2 rounded" />
            <input required placeholder="Email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full border p-2 rounded" />
            <input required placeholder="Phone" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} className="w-full border p-2 rounded" />
            <button type="submit" className={`w-full text-white p-2 rounded ${isEditing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {isEditing ? 'Update User' : 'Register User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
// --- Circulation ---
const Circulation = () => {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');
  
  const [borrowUserId, setBorrowUserId] = useState('');
  const [borrowBookId, setBorrowBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setRecords(await api.fetchBorrowRecords());
    setUsers(await api.fetchUsers());
    setBooks(await api.fetchBooks());
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.borrowBook(borrowUserId, borrowBookId, dueDate);
      alert("Success!");
      await loadData(); // Refresh list
      setBorrowBookId('');
    } catch (err) { alert("Error borrowing book"); }
  };

  const handleReturn = async (bookId: string) => {
    await api.returnBook(bookId);
    await loadData();
  };

  const availableBooks = books.filter(b => b.Status === 'Available');

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Circulation Desk</h2>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('borrow')} className={`px-4 py-2 rounded ${activeTab === 'borrow' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Borrow</button>
        <button onClick={() => setActiveTab('return')} className={`px-4 py-2 rounded ${activeTab === 'return' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Return</button>
      </div>

      {activeTab === 'borrow' && (
        <div className="bg-white p-6 rounded-xl border max-w-2xl">
          <form onSubmit={handleBorrow} className="space-y-4">
            <select required value={borrowUserId} onChange={e => setBorrowUserId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">-- Select User --</option>
              {users.map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
            </select>
            <select required value={borrowBookId} onChange={e => setBorrowBookId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">-- Select Available Book --</option>
              {availableBooks.map(b => <option key={b.BookID} value={b.BookID}>{b.Title}</option>)}
            </select>
            <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border p-2 rounded" />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Confirm Borrow</button>
          </form>
        </div>
      )}

      {activeTab === 'return' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left">User</th><th className="px-6 py-3 text-left">Book</th><th className="px-6 py-3 text-left">Due</th><th className="px-6 py-3">Action</th></tr></thead>
            <tbody className="bg-white divide-y">
              {records.filter(r => !r.ReturnDate).map(r => (
                <tr key={r.RecordID}><td className="px-6 py-4">{r.UserID}</td><td className="px-6 py-4">{r.BookID}</td><td className="px-6 py-4">{new Date(r.DueDate).toLocaleDateString()}</td><td className="px-6 py-4"><button onClick={() => handleReturn(r.BookID)} className="text-blue-600">Return</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Smart Librarian (Pass real data to AI) ---
const SmartLibrarian = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;
    setLoading(true);
    
    // 获取最新的书籍数据喂给 AI
    const books = await api.fetchBooks();
    const answer = await askLibrarian(query, books);
    
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8"><h2 className="text-2xl font-bold">AI Librarian</h2></div>
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <form onSubmit={handleAsk} className="flex gap-2 mb-6">
          <input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 border p-3 rounded" placeholder="Ask about books..." />
          <button disabled={loading} className="bg-purple-600 text-white px-6 rounded">{loading ? '...' : 'Ask'}</button>
        </form>
        <div className="prose">{response}</div>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'books': return <BookManagement />;
      case 'users': return <UserManagement />;
      case 'circulation': return <Circulation />;
      case 'smart': return <SmartLibrarian />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800"><h1 className="font-bold text-lg">SmartLib DB</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          {['dashboard', 'books', 'users', 'circulation', 'smart'].map(v => (
            <button key={v} onClick={() => setCurrentView(v)} className={`w-full text-left px-4 py-3 rounded ${currentView === v ? 'bg-blue-600' : 'hover:bg-slate-800'} capitalize`}>
              {v}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default App;