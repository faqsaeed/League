import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password || !confirmPassword) {
      setResponseMsg('Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setResponseMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Send data to the backend
      const res = await axios.post('http://localhost:5000/signup', { username, password });

      // Display response message
      setResponseMsg(res.data.msg);
    } catch (err) {
      // Error handling
      setResponseMsg(err.response?.data?.msg || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.bgText}>Welcome to PSL FANHUB</div>
        <h2>Create Account</h2>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p>{responseMsg}</p>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
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
    background: 'linear-gradient(to bottom right, #f5f5dc, #e6ffe6, #e6f0ff, #fff5e6)',
    padding: '60px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
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
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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

export default SignUp;
