// api.ts
import { Book } from './types';

const API_BASE = 'http://localhost:3001/api';

// 获取所有书籍
export const fetchBooks = async (): Promise<Book[]> => {
  const res = await fetch(`${API_BASE}/books`);
  return res.json();
};

// 添加书籍
export const addBook = async (book: Book) => {
  await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
};

// 删除书籍
export const deleteBook = async (id: string) => {
  await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
};

// 借书
export const borrowBook = async (userId: string, bookId: string) => {
  // 这里简化处理，DueDate 设为 7 天后
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  
  await fetch(`${API_BASE}/borrow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      UserID: userId, 
      BookID: bookId, 
      DueDate: dueDate.toISOString().slice(0, 19).replace('T', ' ') 
    }),
  });
};

// 还书
export const returnBook = async (bookId: string) => {
  await fetch(`${API_BASE}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ BookID: bookId }),
  });
};