import { Book, User, BorrowRecord, Admin, BookStatus } from '../types';

// Initial Seed Data (Simulating MySQL Pre-population)
let books: Book[] = [
  { BookID: 'B001', Title: 'Database System Concepts', Author: 'Abraham Silberschatz', Category: 'Computer Science', PublishYear: 2019, Status: BookStatus.Available, Description: 'The fundamental text for database systems.' },
  { BookID: 'B002', Title: 'Introduction to Algorithms', Author: 'Thomas H. Cormen', Category: 'Computer Science', PublishYear: 2009, Status: BookStatus.Borrowed, Description: 'Comprehensive guide to algorithms.' },
  { BookID: 'B003', Title: 'The Great Gatsby', Author: 'F. Scott Fitzgerald', Category: 'Literature', PublishYear: 1925, Status: BookStatus.Available, Description: 'A novel about the American dream.' },
  { BookID: 'B004', Title: 'Clean Code', Author: 'Robert C. Martin', Category: 'Computer Science', PublishYear: 2008, Status: BookStatus.Available, Description: 'A handbook of agile software craftsmanship.' },
  { BookID: 'B005', Title: 'Design Patterns', Author: 'Erich Gamma', Category: 'Computer Science', PublishYear: 1994, Status: BookStatus.Available, Description: 'Elements of reusable object-oriented software.' },
];

let users: User[] = [
  { UserID: 'U001', Name: 'Alice Johnson', Email: 'alice@example.com', Phone: '555-0101', RegisterDate: '2025-01-15' },
  { UserID: 'U002', Name: 'Bob Smith', Email: 'bob@example.com', Phone: '555-0102', RegisterDate: '2025-02-20' },
  { UserID: 'U003', Name: 'Charlie Brown', Email: 'charlie@example.com', Phone: '555-0103', RegisterDate: '2025-03-10' },
];

let borrowRecords: BorrowRecord[] = [
  { RecordID: 'R001', UserID: 'U002', BookID: 'B002', BorrowDate: '2025-10-01', DueDate: '2025-10-15', ReturnDate: null }, // Active borrow
  { RecordID: 'R002', UserID: 'U001', BookID: 'B001', BorrowDate: '2025-09-01', DueDate: '2025-09-15', ReturnDate: '2025-09-10' }, // Returned
];

// Simulating SQL Operations
export const db = {
  getBooks: () => [...books],
  
  getAvailableBooks: () => books.filter(b => b.Status === BookStatus.Available),
  
  addBook: (book: Book) => {
    books.push(book);
    return book;
  },
  
  updateBookStatus: (bookId: string, status: BookStatus) => {
    const idx = books.findIndex(b => b.BookID === bookId);
    if (idx !== -1) {
      books[idx].Status = status;
    }
  },

  getUsers: () => [...users],
  
  addUser: (user: User) => {
    users.push(user);
    return user;
  },

  getBorrowRecords: () => [...borrowRecords],

  // Transaction: Create Record + Update Book Status
  borrowBook: (userId: string, bookId: string, dueDate: string) => {
    const newRecord: BorrowRecord = {
      RecordID: `R${Math.floor(Math.random() * 10000)}`,
      UserID: userId,
      BookID: bookId,
      BorrowDate: new Date().toISOString().split('T')[0],
      DueDate: dueDate,
      ReturnDate: null
    };
    borrowRecords.push(newRecord);
    
    // Trigger Constraint/Update
    const bookIdx = books.findIndex(b => b.BookID === bookId);
    if (bookIdx !== -1) books[bookIdx].Status = BookStatus.Borrowed;
    
    return newRecord;
  },

  // Transaction: Update Record + Update Book Status
  returnBook: (recordId: string) => {
    const idx = borrowRecords.findIndex(r => r.RecordID === recordId);
    if (idx !== -1) {
      borrowRecords[idx].ReturnDate = new Date().toISOString().split('T')[0];
      const bookId = borrowRecords[idx].BookID;
      
      const bookIdx = books.findIndex(b => b.BookID === bookId);
      if (bookIdx !== -1) books[bookIdx].Status = BookStatus.Available;
    }
  },

  getStatistics: () => {
    const active = borrowRecords.filter(r => r.ReturnDate === null).length;
    
    // Group by Category
    const categoryMap: Record<string, number> = {};
    books.forEach(b => {
      categoryMap[b.Category] = (categoryMap[b.Category] || 0) + 1;
    });

    return {
      totalBooks: books.length,
      totalUsers: users.length,
      activeBorrows: active,
      overdueBooks: 0, // Simplified for demo
      categoryDistribution: Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }))
    };
  }
};