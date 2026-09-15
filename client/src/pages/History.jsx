import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_URL = 'https://ai-mock-interview-backend-bip7.onrender.com'

function History() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filters, setFilters] = useState({ role: '', category: '', difficulty: '' })

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = {}
      if (filters.role) params.role = filters.role
      if (filters.category) params.category = filters.category
      if (filters.difficulty) params.difficulty = filters.difficulty

      const res = await axios.get(`${API_URL}/api/interview/question-history`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      setQuestions(res.data.questions)
    } catch (err) {
      console.error('Failed to fetch question history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'SDE']
  const difficulties = ['Easy', 'Medium', 'Hard']

  const scoreColor = (score) => {
    if (score >= 8) return '#10b981'
    if (score >= 5) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '25px' }}>
            <h1 style={{ margin: 0, color: '#333' }}>📚 Question History</h1>
            <p style={{ color: '#666', margin: '8px 0 0' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} practiced so far
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option value="">All Roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option value="">All Difficulties</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {(filters.role || filters.category || filters.difficulty) && (
              <button
                onClick={() => setFilters({ role: '', category: '', difficulty: '' })}
                style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#e5e7eb', color: '#333', cursor: 'pointer', fontSize: '14px' }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading...</div>
          ) : questions.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '50px', textAlign: 'center', color: '#888', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              No questions found. Try adjusting filters or start a new practice session!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}
                >
                  <div
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '600', color: '#333', fontSize: '15px' }}>{q.question}</p>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {q.role && <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#ede9fe', color: '#6d28d9' }}>{q.role}</span>}
                        {q.category && <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>{q.category}</span>}
                        {q.difficulty && <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#b45309' }}>{q.difficulty}</span>}
                        <span style={{ fontSize: '12px', color: '#999' }}>{new Date(q.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontWeight: 'bold', color: scoreColor(q.score), fontSize: '16px' }}>{q.score}/10</span>
                      <span style={{ color: '#999', fontSize: '18px' }}>{expandedId === q.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {expandedId === q.id && (
                    <div style={{ padding: '0 22px 20px', borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ marginTop: '15px' }}>
                        <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '600', color: '#888' }}>YOUR ANSWER</p>
                        <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>{q.userAnswer}</p>
                      </div>
                      {q.feedback && (
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: '600', color: '#888' }}>AI FEEDBACK</p>
                          <p style={{ margin: 0, color: '#444', lineHeight: 1.5 }}>{q.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default History