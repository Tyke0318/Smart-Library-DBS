import { Book, User, BorrowRecord } from '../types';

const API_BASE = 'http://localhost:3001/api';

// 书籍 API
export const fetchBooks = async (): Promise<Book[]> => {
  const res = await fetch(`${API_BASE}/books`);
  return res.json();
};

export const addBook = async (book: Book) => {
  await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
};

// 用户 API
export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
};

export const addUser = async (user: User) => {
  await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
};

// 借阅 API
export const fetchBorrowRecords = async (): Promise<BorrowRecord[]> => {
  const res = await fetch(`${API_BASE}/borrow`);
  return res.json();
};

export const borrowBook = async (userId: string, bookId: string) => {
  const res = await fetch(`${API_BASE}/borrow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, bookId }), // 注意：这里不传 dueDate 了
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Borrow failed');
  }
  
  return res.json();
};

export const returnBook = async (bookId: string) => {
  await fetch(`${API_BASE}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ BookID: bookId }),
  });
};
// --- 书籍部分新增 ---
export const updateBook = async (id: string, book: Partial<Book>) => {
  await fetch(`${API_BASE}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
};

// deleteBook 之前如果写过了就不用改，没写过就加上
export const deleteBook = async (id: string) => {
  const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Delete failed");
};
// --- 用户部分新增 ---
export const updateUser = async (id: string, user: Partial<User>) => {
  await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Delete failed");
};