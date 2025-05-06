import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import "../styles/Transactions.css";

const Transactions = () => {
  const [players, setPlayers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [formData, setFormData] = useState({});
  const [teamID, setTeamID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const currentTeamID = decoded?.teamID;

  useEffect(() => {
    if (!token || !decoded) {
      setError('Authentication token is missing or invalid');
      return;
    }

    const tokenExpiration = decoded.exp * 1000;
    if (Date.now() >= tokenExpiration) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setTeamID(currentTeamID);
    fetchPlayers();
    fetchTransactions();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/players', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(res.data);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      const relevant = res.data.filter(
        tx => tx.ToTeamID === decoded.teamID || tx.FromTeamID === decoded.teamID
      );
      setTransactions(relevant);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const initiateTransaction = (player) => {
    if (player.TeamID === teamID) return;
    setSelectedPlayer(player);
    setFormData({
      playerID: player.PlayerID,
      fromTeamID: player.TeamID,
      toTeamID: teamID,
      type: 'permanent',
      amount: 100000,
      status: 'pending',
      loanStartDate: '',
      loanEndDate: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.type === 'loan' && (!formData.loanStartDate || !formData.loanEndDate)) {
      setError('Loan dates are required for loan transactions');
      setLoading(false);
      return;
    }

    const tokenExpiration = decoded.exp * 1000;
    if (Date.now() >= tokenExpiration) {
      setError('Your session has expired. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const currentToken = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/transactions', formData, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
      });

      alert('Transaction Initiated');
      setSelectedPlayer(null);
      setFormData({});
      fetchTransactions();
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('Permission denied: You may need manager rights or the player is restricted.');
        } else if (err.response.status === 401) {
          setError('Authentication error: Please log out and log in again.');
        } else {
          setError(`Failed to initiate transaction: ${err.response.data.message || err.response.statusText}`);
        }
      } else if (err.request) {
        setError('Failed to initiate transaction: No response from server');
      } else {
        setError(`Failed to initiate transaction: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resolveTransaction = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this transaction?`)) return;

    setLoading(true);
    setError('');
    try {
      await axios.put(`http://localhost:5000/api/transactions/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Transaction ${status}`);
      fetchTransactions();
    } catch (err) {
      console.error('Update failed:', err);
      setError(`Failed to ${status} transaction`);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      {loading && <div className="loading-spinner">Loading...</div>}

      <div className="section">
        <h2>All Players</h2>
        {players.length === 0 ? (
          <p>No players found</p>
        ) : (
          <ul className="player-list">
            {players.map(player => (
              <li key={player.PlayerID} className="player-item">
                <div className="player-info">
                  <strong>{player.Name}</strong> ({player.TeamName})
                </div>
                {player.TeamID !== teamID && (
                  <button
                    className="transaction-button"
                    onClick={() => initiateTransaction(player)}
                    disabled={loading}
                  >
                    Initiate Transaction
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPlayer && (
        <div className="section">
          <form onSubmit={handleTransactionSubmit} className="transaction-form">
            <h3>Initiate Transaction for {selectedPlayer.Name}</h3>

            <div className="form-group">
              <label>Type:</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                disabled={loading}
              >
                <option value="permanent">Permanent</option>
                <option value="loan">Loan</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount:</label>
              <input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleFormChange}
                min="0"
                required
                disabled={loading}
              />
            </div>

            {formData.type === 'loan' && (
              <>
                <div className="form-group">
                  <label>Loan Start Date:</label>
                  <input
                    type="date"
                    name="loanStartDate"
                    value={formData.loanStartDate}
                    onChange={handleFormChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Loan End Date:</label>
                  <input
                    type="date"
                    name="loanEndDate"
                    value={formData.loanEndDate}
                    onChange={handleFormChange}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      <div className="section">
        <h2>Pending Transactions</h2>
        {transactions.length === 0 ? (
          <p>No pending transactions</p>
        ) : (
          <ul className="transaction-list">
            {transactions.map(tx => (
              <li key={tx.TransactionID} className="transaction-item">
                <div className="transaction-info">
                  <strong>{tx.PlayerName}</strong> from <strong>{tx.FromTeam}</strong> to <strong>{tx.ToTeam}</strong>
                  <div>Type: {tx.Type} | Amount: ${tx.Amount} | Status: {tx.Status}</div>
                </div>
                {tx.Status === 'pending' && tx.FromTeamID === teamID && (
                  <div className="transaction-actions">
                    <button onClick={() => resolveTransaction(tx.TransactionID, 'completed')} disabled={loading}>
                      Approve
                    </button>
                    <button onClick={() => resolveTransaction(tx.TransactionID, 'rejected')} disabled={loading}>
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Transactions;
