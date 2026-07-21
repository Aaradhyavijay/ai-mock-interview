import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_URL = 'https://ai-mock-interview-backend-bip7.onrender.com'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState({ questionsPracticed: 0, sessionsCompleted: 0, avgScore: 0, roleBreakdown: [] })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_URL}/api/interview/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(res.data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ backgroundColor: '#4f46e5', padding: '30px', borderRadius: '10px', color: 'white', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>Welcome back, {user.name}! 👋</h1>
            <p style={{ margin: '10px 0 0', opacity: 0.8 }}>Ready for your next interview practice?</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h2 style={{ color: '#4f46e5', fontSize: '36px', margin: 0 }}>{stats.questionsPracticed}</h2>
              <p style={{ color: '#666', margin: '5px 0 0' }}>Questions Practiced</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h2 style={{ color: '#10b981', fontSize: '36px', margin: 0 }}>{stats.sessionsCompleted}</h2>
              <p style={{ color: '#666', margin: '5px 0 0' }}>Sessions Completed</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h2 style={{ color: '#f59e0b', fontSize: '36px', margin: 0 }}>{stats.avgScore}/10</h2>
              <p style={{ color: '#666', margin: '5px 0 0' }}>Average Score</p>
            </div>
          </div>

          {stats.roleBreakdown && stats.roleBreakdown.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>📊 Performance by Role</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.roleBreakdown.map((r) => (
                  <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#333' }}>{r.role}</span>
                      <span style={{ color: '#888', marginLeft: '10px', fontSize: '13px' }}>{r.questions} question{r.questions !== 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{r.avgScore}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>🚀 Quick Start</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <button onClick={() => navigate('/interview')} style={{ padding: '20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                💻 DSA Practice
              </button>
              <button onClick={() => navigate('/interview')} style={{ padding: '20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                🧠 Behavioral Round
              </button>
              <button onClick={() => navigate('/interview')} style={{ padding: '20px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                👔 HR Round
              </button>
              <button onClick={() => navigate('/interview')} style={{ padding: '20px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
                🏗️ System Design
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard