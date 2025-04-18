import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });
      setResponseMsg(res.data.msg);
    } catch (err) {
      setResponseMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.bgText}>Yeh Khel Deewano Ka</div>
        <h2>PSL FANHUB</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p>{responseMsg}</p>
        <p>
          Don't have an account? <Link to="/signup">signup</Link>
        </p>
      </div>

      <div style={styles.right}>
        <img src="/p1.png" alt="PSL" style={styles.image} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(to bottom right, #f5f5dc, #e6ffe6, #e6f0ff, #fff5e6)', // Light yellow, green, blue, orange mix
    padding: '60px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative', // Important for absolute positioning inside
    overflow: 'hidden',
  },
  
  bgText: {
    position: 'absolute',
    top: '10%',
    left: '0',
    width: '100%',
    textAlign: 'center',
    fontSize: '55px',
    fontWeight: '900',
    background: 'linear-gradient(to right,rgb(50, 21, 1), #8B4000, #2e0854, #6B8E23, #3a3a3a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    opacity: 0.15,
    zIndex: 0,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // prevents scrollbars or overflow
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // fixes the issue
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px',
    backgroundColor: '#4a90e2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Login;
