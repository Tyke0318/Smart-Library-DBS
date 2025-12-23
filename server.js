import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'smart_library',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- 书籍相关 ---
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Books');
        res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.post('/api/books', async (req, res) => {
    const { BookID, Title, Author, Category, PublishYear, Description } = req.body;
    try {
        await pool.query(
            'INSERT INTO Books (BookID, Title, Author, Category, PublishYear, Status, Description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [BookID, Title, Author, Category, PublishYear, 'Available', Description]
        );
        res.json({ message: 'Book added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/books/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. 第一步：先删除这本书所有的借阅历史 (BorrowRecords)
        await connection.query('DELETE FROM BorrowRecords WHERE BookID = ?', [req.params.id]);

        // 2. 第二步：由于没有历史记录牵绊了，现在可以删除书了 (Books)
        await connection.query('DELETE FROM Books WHERE BookID = ?', [req.params.id]);

        await connection.commit();
        res.json({ message: 'Book and its history deleted' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// 3.5 修改书籍 (新增)
app.put('/api/books/:id', async (req, res) => {
    const { Title, Author, Category, PublishYear } = req.body;
    try {
        await pool.query(
            'UPDATE Books SET Title=?, Author=?, Category=?, PublishYear=? WHERE BookID=?',
            [Title, Author, Category, PublishYear, req.params.id]
        );
        res.json({ message: 'Book updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- 用户相关 (新增) ---
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Users');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
    const { UserID, Name, Email, Phone } = req.body;
    try {
        await pool.query(
            'INSERT INTO Users (UserID, Name, Email, Phone) VALUES (?, ?, ?, ?)',
            [UserID, Name, Email, Phone]
        );
        res.json({ message: 'User added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// 6. 删除用户 (新增)
app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Users WHERE UserID = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: '无法删除：该用户可能有借书记录' });
    }
});

// --- 7. 修改用户 (增强调试版) ---
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { Name, Email, Phone } = req.body;

    console.log(`[Update User] 收到请求，目标ID: "${userId}"`);
    console.log(`[Update User] 想要修改为:`, req.body);

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query(
            'UPDATE Users SET Name=?, Email=?, Phone=? WHERE UserID=?',
            [Name, Email, Phone, userId]
        );

        console.log(`[Update User] 数据库反馈: 影响了 ${result.affectedRows} 行`);

        if (result.affectedRows === 0) {
            console.log("⚠️ 警告: 没有行被修改，可能是ID不匹配！");
            res.status(404).json({ error: "用户不存在或ID不匹配" });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    } catch (err) {
        console.error("❌ 修改失败:", err);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});
// --- 借阅相关 (新增列表查询) ---
app.get('/api/borrow', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM BorrowRecords');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ... 其他接口 ...

// === ⬇️ 新增/替换：借书接口 (自动计算 DueDate) ⬇️ ===
app.post('/api/borrow', async (req, res) => {
    const { userId, bookId } = req.body;

    // 1. 在后端计算日期
    const now = new Date();
    const borrowDate = now.toISOString().split('T')[0]; // 格式: YYYY-MM-DD

    // 计算 DueDate (当前时间 + 1个月)
    const due = new Date();
    due.setMonth(due.getMonth() + 1); 
    const dueDate = due.toISOString().split('T')[0];

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 2. 检查书是否处于 Available 状态 (防止重复借阅)
        const [books] = await connection.query('SELECT Status FROM Books WHERE BookID = ?', [bookId]);
        if (books.length === 0 || books[0].Status !== 'Available') {
            throw new Error('这本书不存在，或者已经被借走了！');
        }

        // 3. 插入借阅记录 (使用我们计算好的 dueDate)
        await connection.query(
            'INSERT INTO BorrowRecords (UserID, BookID, BorrowDate, DueDate) VALUES (?, ?, ?, ?)',
            [userId, bookId, borrowDate, dueDate]
        );

        // 4. 更新书籍状态为 Borrowed
        await connection.query('UPDATE Books SET Status = ? WHERE BookID = ?', ['Borrowed', bookId]);

        await connection.commit();
        res.json({ message: 'Borrow successful', dueDate: dueDate });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.post('/api/return', async (req, res) => {
    const { RecordID, BookID } = req.body; // 注意：这里改用 RecordID 更准确，或者只用 BookID 也可以，为了兼容性我们用 BookID
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE Books SET Status = ? WHERE BookID = ?', ['Available', BookID]);
        await connection.query('UPDATE BorrowRecords SET ReturnDate = NOW() WHERE BookID = ? AND ReturnDate IS NULL', [BookID]);
        
        await connection.commit();
        res.json({ message: 'Returned' });
    } catch (err) { await connection.rollback(); res.status(500).json({ error: err.message }); } finally { connection.release(); }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));