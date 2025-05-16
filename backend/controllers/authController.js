const { sql, poolPromise } = require('../config/db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const pool = await poolPromise;
      const [result] = await pool.request()
        .input('email', sql.VarChar, profile.emails[0].value)
        .query('SELECT * FROM Users WHERE Email = @email');

      if (result.recordset.length > 0) {
        return done(null, result.recordset[0]);
      } else {
        // Create new user if not exists
        const newUser = await pool.request()
          .input('email', sql.VarChar, profile.emails[0].value)
          .input('name', sql.VarChar, profile.displayName)
          .query('INSERT INTO Users (Email, Name) OUTPUT INSERTED.* VALUES (@email, @name)');
        
        return done(null, newUser.recordset[0]);
      }
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  // Lưu user.UserID vào session
  done(null, user.UserID);
});

passport.deserializeUser(async (id, done) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE UserID = @id');
    
    if (result.recordset.length > 0) {
      done(null, result.recordset[0]);
    } else {
      done(new Error('User not found'));
    }
  } catch (err) {
    done(err);
  }
});

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Email và mật khẩu không được để trống' 
    });
  }

  try {
    const pool = await poolPromise;
    const [result] = await pool
      .query('SELECT * FROM Users WHERE Email = ? AND Password = ?',[email,password]);
    if (result.length > 0) {
      const user = result[0];
      const vocabulary = await pool
        .query('SELECT * FROM Vocabulary WHERE UserID = @userID',[result.UserID]);
      req.session.user = {
        userInfo: user,
        vocabulary: vocabulary
      }
      req.session.save(err => {
        if (err) {
          console.error('Lỗi lưu session:', err);
          return res.status(500).send('Lỗi server');
        }
      });
      return res.status(200).json({ 
        status: 'success',
        message: 'Đăng nhập thành công!'
      });
    } else {
      return res.status(401).json({ 
        status: 'error',
        message: 'Sai email hoặc mật khẩu' 
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
};

// Google authentication routes
const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

const googleAuthCallback = passport.authenticate('google', { 
  failureRedirect: '/login',
  successRedirect: 'http://localhost:3000'
});

const registerUser = async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
      return res.status(400).json({
          status: 'error',
          message: 'Email và mật khẩu không được để trống'
      });
  }
  try {
      const pool = await poolPromise;
      const [result] = await pool
          .query('select * from Users where email = ?',[email]);
      if (result.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Email đã tồn tại'
        });
      }
      await pool
          .query('insert into Users (Email, Password) values (?, ?)',[email,password]);
      return res.status(200).json({
          status: 'success',
          message: 'Đăng ký thành công'
      });
  } catch (error) {
      return res.status(500).json({
          status: 'error',
          message: 'Đăng ký thất bại'
      });
  }
};

const logoutUser = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Đăng xuất thất bại'
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  });
};

module.exports = { 
  loginUser,
  googleAuth,
  googleAuthCallback,
  registerUser,
  logoutUser
};