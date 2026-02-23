/**
 * BACKEND API ENDPOINTS REQUIRED
 * 
 * This document outlines the API endpoints that your backend needs to implement
 * for the JWT authentication system to work properly.
 */

// ============================================
// 1. LOGIN ENDPOINT
// ============================================
/**
 * POST /api/auth/login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Response (200 OK):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "user_id_123",
 *     "email": "user@example.com",
 *     "name": "John Doe"
 *   }
 * }
 * 
 * Error Response (401 Unauthorized):
 * {
 *   "message": "Invalid email or password"
 * }
 */

// ============================================
// 2. REGISTER ENDPOINT
// ============================================
/**
 * POST /api/auth/register
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123",
 *   "confirmPassword": "password123"
 * }
 * 
 * Response (201 Created):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "user_id_123",
 *     "email": "john@example.com",
 *     "name": "John Doe"
 *   }
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "message": "Email already exists"
 * }
 */

// ============================================
// 3. REFRESH TOKEN ENDPOINT
// ============================================
/**
 * POST /api/auth/refresh
 * 
 * Request Body:
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response (200 OK):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "user_id_123",
 *     "email": "user@example.com",
 *     "name": "John Doe"
 *   }
 * }
 * 
 * Error Response (401 Unauthorized):
 * {
 *   "message": "Invalid or expired refresh token"
 * }
 */

// ============================================
// JWT TOKEN REQUIREMENTS
// ============================================
/**
 * JWT Token Payload (decoded):
 * {
 *   "sub": "user_id_123",
 *   "email": "user@example.com",
 *   "name": "John Doe",
 *   "iat": 1642158634,
 *   "exp": 1642162234
 * }
 * 
 * Requirements:
 * - 'sub' (subject): User ID
 * - 'email': User email
 * - 'name': User name
 * - 'iat' (issued at): Token creation time (unix timestamp)
 * - 'exp' (expiration): Token expiration time (unix timestamp)
 */

// ============================================
// EXAMPLE NODE.JS/EXPRESS BACKEND
// ============================================
/**
 * Install dependencies:
 * npm install express bcryptjs jsonwebtoken dotenv
 * 
 * Example implementation (.env):
 * JWT_SECRET=your_secret_key_here
 * REFRESH_TOKEN_SECRET=your_refresh_secret_key_here
 * JWT_EXPIRE=1h
 * REFRESH_TOKEN_EXPIRE=7d
 * 
 * Example auth.routes.js:
 */

/*
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const users = []; // Replace with actual database

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      },
      process.env.JWT_SECRET
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      passwordHash: hashedPassword
    };

    users.push(newUser);

    const token = jwt.sign(
      {
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      },
      process.env.JWT_SECRET
    );

    const refreshToken = jwt.sign(
      { sub: newUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh Token Route
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = users.find(u => u.id === decoded.sub);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      },
      process.env.JWT_SECRET
    );

    const newRefreshToken = jwt.sign(
      { sub: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    );

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

module.exports = router;
*/

export const API_DOCS = 'Backend API Documentation - See comments above';
