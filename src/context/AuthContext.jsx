import React, { createContext, useContext, useState } from 'react';
import { CONFIG } from '../config/config';
import { fetchAuthData } from '../services/googleSheetsApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(CONFIG.storageKeys.currentUser);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const login = async (id, password) => {
    setLoading(true);
    try {
      const users = await fetchAuthData();
      if (!users || users.length === 0) {
        throw new Error('Không thể tải danh sách tài khoản từ Google Sheets (DSNV). Vui lòng thử lại!');
      }

      const inputId = (id || '').toString().trim().toLowerCase();
      const inputPass = (password || '').toString().trim();

      const matched = users.find(
        (u) => u.id.toLowerCase() === inputId && u.password === inputPass
      );

      if (!matched) {
        throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
      }

      if (matched.tinhTrang && matched.tinhTrang.toLowerCase().includes('nghỉ')) {
        throw new Error('Tài khoản này đã bị khóa hoặc ngừng hoạt động!');
      }

      const userObj = {
        id: matched.id,
        name: matched.name || matched.id,
        role: (matched.role || 'user').toLowerCase(),
      };

      setCurrentUser(userObj);
      localStorage.setItem(CONFIG.storageKeys.currentUser, JSON.stringify(userObj));
      localStorage.setItem(CONFIG.storageKeys.lastUserId, userObj.id);
      toast.success?.(`Xin chào, ${userObj.name}!`);
      return userObj;
    } catch (err) {
      toast.error?.(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CONFIG.storageKeys.currentUser);
    toast.info?.('Đã đăng xuất khỏi hệ thống');
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, currentUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
