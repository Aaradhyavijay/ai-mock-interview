import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

function Interview() {
  const [role, setRole] = useState('Software Engineer Intern')
  const [category, setCategory] = useState('DSA')
  const [difficulty, setDifficulty] = useState('Easy')
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')

  const generateQuestion = async () => {
    setLoading(true)
    setError('')
    setShowHints(false)
    setShowAnswer(false)
    setUserAnswer('')
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* Selection Card */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ color: '#555', marginBottom: '20px' }}>Select Interview Type</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
                <option>Software Engineer Intern</option>
                <option>Data Analyst</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
                <option>DSA</option>
                <option>Behavioral</option>
                <option>HR</option>
                <option>System Design</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <button onClick={generateQuestion} disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#aaa' : '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Generating...' : '🚀 Generate Question'}
            </button>

            {error && !question && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
          </div>

          {/* Question Card */}
          {question && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3 style={{ color: '#4f46e5', marginBottom: '15px' }}>📝 Question</h3>
              <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>{question.question}</p>

              <h4 style={{ color: '#555', marginBottom: '10px' }}>✍️ Your Answer</h4>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Write your answer here..."
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
              />

              <button onClick={() => setShowHints(!showHints)}
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '15px', cursor: 'pointer' }}>
                {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
              </button>

              {showHints && (
                <div style={{ marginTop: '15px', backgroundColor: '#fffbeb', padding: '15px', borderRadius: '5px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ color: '#92400e', marginBottom: '10px' }}>💡 Hints</h4>
                  <ul style={{ color: '#78350f', lineHeight: '2', paddingLeft: '20px' }}>
                    {question.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => setShowAnswer(!showAnswer)}
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '15px', cursor: 'pointer' }}>
                {showAnswer ? '🙈 Hide Answer' : '✅ Show Ideal Answer'}
              </button>

              {showAnswer && (
                <div style={{ marginTop: '15px', backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '5px', border: '1px solid #6ee7b7' }}>
                  <h4 style={{ color: '#065f46', marginBottom: '10px' }}>✅ Ideal Answer</h4>
                  <p style={{ color: '#064e3b', lineHeight: '1.6' }}>{question.idealAnswer}</p>
                </div>
              )}

              <button onClick={generateQuestion}
                style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
                🔄 Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Interview