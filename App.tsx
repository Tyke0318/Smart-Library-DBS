import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  Search, 
  LogOut, 
  Plus, 
  Bot,
  Library
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { db } from './services/mockDb';
import { askLibrarian } from './services/aiService';
import { Book, User, BorrowRecord, BookStatus } from './types';

// --- Sub-Components (Defined here for single-file requirement simplicity within XML structure) ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('123456');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple check matching the "no hashing yet" prompt status
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
          <div className="bg-blue-600 p-3 rounded-full">
            <Library className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Smart Library System</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Account</label>
            <input 
              type="text" 
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Admin Login
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Project Demo, Sichuan University Pittsburgh Institute</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const stats = db.getStatistics();
  const data = stats.categoryDistribution;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600 mr-4">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Books</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalBooks}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg text-green-600 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Registered Users</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600 mr-4">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Borrows</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.activeBorrows}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Books by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>(db.getBooks());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Book State
  const [newBook, setNewBook] = useState({
    BookID: '',
    Title: '',
    Author: '',
    Category: '',
    PublishYear: new Date().getFullYear(),
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    const bookToAdd: Book = {
      ...newBook,
      Status: BookStatus.Available
    };
    db.addBook(bookToAdd);
    setBooks(db.getBooks()); // Refresh
    setShowAddModal(false);
    setNewBook({ BookID: '', Title: '', Author: '', Category: '', PublishYear: 2024 });
  };

  const filteredBooks = books.filter(b => 
    b.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.Author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Book Inventory</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Title or Author..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredBooks.map((book) => (
                <tr key={book.BookID} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{book.BookID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{book.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{book.Author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{book.Category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      book.Status === BookStatus.Available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {book.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Book ID</label>
                  <input required type="text" value={newBook.BookID} onChange={e => setNewBook({...newBook, BookID: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Publish Year</label>
                  <input required type="number" value={newBook.PublishYear} onChange={e => setNewBook({...newBook, PublishYear: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input required type="text" value={newBook.Title} onChange={e => setNewBook({...newBook, Title: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Author</label>
                <input required type="text" value={newBook.Author} onChange={e => setNewBook({...newBook, Author: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select value={newBook.Category} onChange={e => setNewBook({...newBook, Category: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2">
                  <option value="">Select Category</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Literature">Literature</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="History">History</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [newUser, setNewUser] = useState({ UserID: '', Name: '', Email: '', Phone: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    db.addUser({
      ...newUser,
      RegisterDate: new Date().toISOString().split('T')[0]
    });
    setUsers(db.getUsers());
    setNewUser({ UserID: '', Name: '', Email: '', Phone: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Users Directory</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.UserID}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.UserID}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{user.Name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.Email}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.RegisterDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Register User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">User ID</label>
              <input required type="text" value={newUser.UserID} onChange={e => setNewUser({...newUser, UserID: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input required type="text" value={newUser.Name} onChange={e => setNewUser({...newUser, Name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input required type="email" value={newUser.Email} onChange={e => setNewUser({...newUser, Email: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input required type="tel" value={newUser.Phone} onChange={e => setNewUser({...newUser, Phone: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md">Register User</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Circulation = () => {
  const [records, setRecords] = useState<BorrowRecord[]>(db.getBorrowRecords());
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');

  // Borrow Form State
  const [borrowUserId, setBorrowUserId] = useState('');
  const [borrowBookId, setBorrowBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const availableBooks = db.getAvailableBooks();
  const users = db.getUsers();

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    db.borrowBook(borrowUserId, borrowBookId, dueDate);
    setRecords(db.getBorrowRecords());
    // Reset
    setBorrowBookId('');
    alert("Book borrowed successfully!");
  };

  const handleReturn = (recordId: string) => {
    db.returnBook(recordId);
    setRecords(db.getBorrowRecords());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Circulation Desk</h2>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('borrow')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'borrow' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
        >
          Borrow Book
        </button>
        <button 
          onClick={() => setActiveTab('return')}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'return' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
        >
          Return Book
        </button>
      </div>

      {activeTab === 'borrow' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl">
          <h3 className="text-lg font-bold mb-4">Create New Loan</h3>
          <form onSubmit={handleBorrow} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select User</label>
              <select required value={borrowUserId} onChange={e => setBorrowUserId(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2">
                <option value="">-- Select User --</option>
                {users.map(u => <option key={u.UserID} value={u.UserID}>{u.Name} ({u.UserID})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Book</label>
              <select required value={borrowBookId} onChange={e => setBorrowBookId(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2">
                <option value="">-- Select Available Book --</option>
                {availableBooks.map(b => <option key={b.BookID} value={b.BookID}>{b.Title} ({b.BookID})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md px-3 py-2" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">Confirm Borrow</button>
          </form>
        </div>
      )}

      {activeTab === 'return' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rec ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {records.filter(r => r.ReturnDate === null).map((record) => (
                <tr key={record.RecordID}>
                  <td className="px-6 py-4 text-sm text-slate-900">{record.RecordID}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{record.UserID}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{record.BookID}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{record.DueDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleReturn(record.RecordID)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Return
                    </button>
                  </td>
                </tr>
              ))}
              {records.filter(r => r.ReturnDate === null).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-500">No active loans found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SmartLibrarian = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    // Pass current real-time inventory to the AI
    const inventory = db.getBooks();
    const answer = await askLibrarian(query, inventory);
    
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
          <Bot className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">AI Librarian Assistant</h2>
        <p className="text-slate-500 mt-2">Ask questions about our collection, get recommendations, or check availability.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: 'Recommend a computer science book from before 2000' or 'Is The Great Gatsby available?'"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </form>
        </div>
        
        <div className="p-6 min-h-[200px] bg-white">
          {response ? (
            <div className="prose prose-slate max-w-none">
              <p className="whitespace-pre-line text-slate-800 leading-relaxed">{response}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>Results will appear here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

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
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Library className="text-blue-400" size={28} />
          <div>
            <h1 className="font-bold text-lg">SmartLib</h1>
            <p className="text-xs text-slate-400">Database Project</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('books')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'books' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BookOpen size={20} /> Books
          </button>
          <button onClick={() => setCurrentView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} /> Users
          </button>
          <button onClick={() => setCurrentView('circulation')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'circulation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ArrowLeftRight size={20} /> Circulation
          </button>
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs text-slate-500 uppercase mb-2">Smart Features</p>
            <button onClick={() => setCurrentView('smart')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'smart' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-900/50 hover:text-white'}`}>
              <Bot size={20} /> AI Librarian
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8">
        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="font-bold text-xl text-slate-800">SmartLib</h1>
          <button onClick={() => setIsLoggedIn(false)}><LogOut size={24} /></button>
        </div>
        
        {/* Mobile Nav (simplified) */}
        <div className="md:hidden flex gap-2 overflow-x-auto mb-6 pb-2">
            <button onClick={() => setCurrentView('dashboard')} className="px-3 py-1 bg-slate-200 rounded">Dash</button>
            <button onClick={() => setCurrentView('books')} className="px-3 py-1 bg-slate-200 rounded">Books</button>
            <button onClick={() => setCurrentView('circulation')} className="px-3 py-1 bg-slate-200 rounded">Loan</button>
            <button onClick={() => setCurrentView('smart')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded">AI</button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;