import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API_URL = 'https://ai-mock-interview-backend-bip7.onrender.com'

const ROLE_CATEGORIES = {
  'Software Engineer Intern': ['DSA', 'Behavioral', 'HR', 'System Design'],
  'Data Analyst': ['SQL', 'Statistics', 'Behavioral', 'HR'],
  'Frontend Developer': ['JavaScript & DOM', 'Frontend System Design', 'Behavioral', 'HR'],
  'Backend Developer': ['DSA', 'System Design', 'Databases', 'Behavioral', 'HR'],
  'Full Stack Developer': ['DSA', 'System Design', 'Frontend', 'Backend', 'Behavioral', 'HR']
}

// Time allotted per question, based on difficulty (mirrors real interview pacing)
const DIFFICULTY_TIME = {
  Easy: 90,
  Medium: 120,
  Hard: 180
}

function Interview() {
  const [sessionId] = useState(() => crypto.randomUUID())
  const [role, setRole] = useState('Software Engineer Intern')
  const [category, setCategory] = useState(ROLE_CATEGORIES['Software Engineer Intern'][0])
  const [difficulty, setDifficulty] = useState('Easy')
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [timeUp, setTimeUp] = useState(false)
  const timerRef = useRef(null)

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setCategory(ROLE_CATEGORIES[newRole][0])
  }

  // Countdown effect — runs whenever a fresh question is loaded
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (question && !feedback) {
      setTimeLeft(DIFFICULTY_TIME[difficulty])
      setTimeUp(false)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setTimeUp(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timerRef.current)
  }, [question])

  const generateQuestion = async () => {
    setLoading(true)
    setError('')
    setShowHints(false)
    setShowAnswer(false)
    setUserAnswer('')
    setFeedback(null)
    setTimeUp(false)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${API_URL}/api/interview/generate-question`,
        { role, category, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestion(res.data.data)
    } catch (err) {
      setError('Failed to generate question. Try again!')
    }
    setLoading(false)
  }

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('Please write an answer first!')
      return
    }
    clearInterval(timerRef.current)
    setEvaluating(true)
    setFeedback(null)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post(
        `${API_URL}/api/interview/evaluate-answer`,
        { question: question.question, userAnswer, idealAnswer: question.idealAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setFeedback(res.data.data)
    } catch (err) {
      alert('Failed to evaluate answer. Try again!')
    }
    setEvaluating(false)
  }

  const nextQuestion = async () => {
    if (feedback && question) {
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          `${API_URL}/api/interview/save-session`,
          {
            question: question.question,
            userAnswer,
            score: feedback.score,
            category,
            difficulty,
            sessionId,
            role
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } catch (err) {
        console.error('Failed to save session:', err)
      }
    }
    generateQuestion()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const timerColor = timeLeft <= 15 ? '#dc2626' : timeLeft <= 30 ? '#f59e0b' : '#4f46e5'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ color: '#555', marginBottom: '20px' }}>Select Interview Type</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Role</label>
              <select value={role} onChange={(e) => handleRoleChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
                {Object.keys(ROLE_CATEGORIES).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
                {ROLE_CATEGORIES[role].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px' }}>
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

          {question && (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#4f46e5', margin: 0 }}>📝 Question</h3>
                {!feedback && timeLeft !== null && (
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: timerColor, fontFamily: 'monospace' }}>
                    ⏱️ {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>{question.question}</p>

              {timeUp && !feedback && (
                <p style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '10px 15px', borderRadius: '5px', marginBottom: '15px', fontWeight: '600' }}>
                  ⏰ Time's up! You can still submit your answer, but try to be quicker next time.
                </p>
              )}

              <h4 style={{ color: '#555', marginBottom: '10px' }}>✍️ Your Answer</h4>
              <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Write your answer here..."
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }} />

              <button onClick={submitAnswer} disabled={evaluating}
                style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: evaluating ? '#aaa' : '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: evaluating ? 'not-allowed' : 'pointer' }}>
                {evaluating ? '⏳ Evaluating...' : '✅ Submit Answer for AI Feedback'}
              </button>

              {feedback && (
                <div style={{ marginTop: '15px', backgroundColor: '#eef2ff', padding: '20px', borderRadius: '8px', border: '2px solid #4f46e5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{feedback.score}/10</span>
                    <span style={{ color: '#4338ca', fontSize: '14px' }}>{feedback.verdict}</span>
                  </div>
                  <p style={{ color: '#065f46', marginBottom: '10px' }}><strong>✅ Strengths:</strong> {feedback.strengths}</p>
                  <p style={{ color: '#92400e' }}><strong>📈 Improvements:</strong> {feedback.improvements}</p>
                </div>
              )}

              <button onClick={() => setShowHints(!showHints)}
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '15px', cursor: 'pointer' }}>
                {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
              </button>

              {showHints && (
                <div style={{ marginTop: '15px', backgroundColor: '#fffbeb', padding: '15px', borderRadius: '5px', border: '1px solid #fcd34d' }}>
                  <h4 style={{ color: '#92400e', marginBottom: '10px' }}>💡 Hints</h4>
                  <ul style={{ color: '#78350f', lineHeight: '2', paddingLeft: '20px' }}>
                    {question.hints.map((hint, i) => (<li key={i}>{hint}</li>))}
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

              <button onClick={nextQuestion}
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