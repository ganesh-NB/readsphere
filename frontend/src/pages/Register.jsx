// Register is handled inside Login.jsx (tab switcher).
// This file redirects to /login so any direct /register link still works.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/login', { replace: true }); }, [navigate]);
  return null;
};

export default Register;
