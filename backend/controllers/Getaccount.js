// Lấy tên tài khoản dựa vào userId từ session
const { poolPromise } = require('../config/db');

const getAccountName = async (req, res) => {
    try {
        // Lấy user từ session
        if (!req.session.user || !req.session.user.userInfo) {
            return res.status(401).json({ status: 'error', message: 'Chưa đăng nhập' });
        }
        const userId = req.session.user.userInfo.UserID || req.session.user.userInfo.userId;
        if (!userId) {
            return res.status(400).json({ status: 'error', message: 'Không tìm thấy userId' });
        }
        const pool = await poolPromise;
        const [result] = await pool.query('SELECT Name, Email FROM Users WHERE UserID = ?', [userId]);
        if (result.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy tài khoản' });
        }
        return res.status(200).json({ status: 'success', name: result[0].Name, email: result[0].Email });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Lỗi server', error: err.message });
    }
};

module.exports = { getAccountName };