const { sql, poolPromise } = require('../config/db');

const getUserId = async (req, res) => {
    console.log("userId login getUserId: ",req.session.userId);
    try {
        if (!req.session.userId) {
            return res.status(401).json({ status: 'error', message: 'Chưa đăng nhập' });
        }
        return res.status(200).json({ status: 'success', userId: req.session.userId });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
}
const getAccountName = async (req, res) => {
    try {
        const pool = await poolPromise;
        const [result] = await pool.query('SELECT Name, Email FROM Users WHERE UserID = ?', [req.session.userId]);
        return res.status(200).json({ status: 'success', name: result[0].Name, email: result[0].Email });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
}
const getAccountVocabulary = async (req, res) => {
    try {
        const pool = await poolPromise;
        const [result] = await pool.query('SELECT * FROM Vocabulary WHERE UserID = ?', [req.session.userId]);
        return res.status(200).json({ status: 'success', vocabulary: result });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
}

const updateAccountName = async (req, res) => {
    try {
        const pool = await poolPromise;
        const [result] = await pool.query('UPDATE Users SET Name = ? WHERE UserID = ?', [req.body.name, req.session.userId]);
        return res.status(200).json({ status: 'success', message: 'Cập nhật tên thành công' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
}

const changePassword = async (req, res) => {
    try {
        const pool = await poolPromise;
        const [password] = await pool.query('SELECT Password FROM Users WHERE userId = ?', [req.session.userId]);
        if (password.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy mật khẩu' });
        }
        if (password[0].Password !== req.body.currentPassword) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu cũ không đúng' });
        }
        const [result] = await pool.query('UPDATE Users SET Password = ? WHERE UserID = ?', [req.body.newPassword, req.session.userId]);
        return res.status(200).json({ status: 'success', message: 'Cập nhật mật khẩu thành công' });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
}



module.exports = {
    getUserId,
    getAccountName,
    getAccountVocabulary,
    updateAccountName,
    changePassword,
}