// Matching the ER Diagram from the prompt

export enum BookStatus {
  Available = 'Available',
  Borrowed = 'Borrowed',
  Lost = 'Lost'
}

export interface Book {
  BookID: string;
  Title: string;
  Author: string;
  Category: string;
  PublishYear: number;
  Status: BookStatus;
  Description?: string; // Added for AI context
}

export interface User {
  UserID: string;
  Name: string;
  Email: string;
  Phone: string;
  RegisterDate: string;
}

export interface BorrowRecord {
  RecordID: string;
  UserID: string;
  BookID: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate: string | null; // Null implies currently borrowed
}

export interface Admin {
  AdminID: string;
  Name: string;
  Account: string;
}

export interface Statistics {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBooks: number;
  categoryDistribution: { name: string; value: number }[];
}