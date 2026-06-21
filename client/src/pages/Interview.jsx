import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Interview() {
  const [role, setRole] = useState('Software Engineer Intern')
  const [category, setCategory] = useState('DSA')
  const [difficulty, setDifficulty] = useState('Easy')
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const generateQuestion = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        'http://localhost:5000/api/interview/generate-question',
        { role, category, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestion(res.data.data)
    } catch (err) {
      setError('Failed to generate question. Try again!')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          🎯 AI Mock Interview
        </h1>

        {/* Selection Card */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ color: '#555', marginBottom: '20px' }}>Select Interview Type</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option>Software Engineer Intern</option>
              <option>Data Analyst</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option>DSA</option>
              <option>Behavioral</option>
              <option>HR</option>
              <option>System Design</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <button
            onClick={generateQuestion}
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#aaa' : '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Generating...' : '🚀 Generate Question'}
          </button>

          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
        </div>

        {/* Question Card */}
        {question && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#4f46e5', marginBottom: '15px' }}>📝 Question</h3>
            <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>{question.question}</p>

            <h4 style={{ color: '#666', marginBottom: '10px' }}>💡 Hints</h4>
            <ul style={{ color: '#555', lineHeight: '2' }}>
              {question.hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>

            <h4 style={{ color: '#666', marginTop: '20px', marginBottom: '10px' }}>✅ Ideal Answer</h4>
            <p style={{ color: '#555', lineHeight: '1.6', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>{question.idealAnswer}</p>

            <button
              onClick={generateQuestion}
              style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
            >
              🔄 Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Interview