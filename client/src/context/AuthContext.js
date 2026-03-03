import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);


const login = (token, userData) => {
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); 

    setUser(userData);
    
    console.log("Login state updated for:", userData.role);
  } catch (err) {
    console.error("BROWSER ERROR: Storage access denied.", err);
    alert("Please disable 'Enhanced Tracking Protection' or Ad-blockers to log in.");
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};