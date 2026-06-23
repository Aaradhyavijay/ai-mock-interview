import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{
      backgroundColor: '#4f46e5',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <h2
        onClick={() => navigate('/dashboard')}
        style={{ color: 'white', margin: 0, cursor: 'pointer', fontSize: '20px' }}
      >
        🎯 AI Mock Interview
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span
          onClick={() => navigate('/interview')}
          style={{ color: 'white', cursor: 'pointer', fontSize: '14px' }}
        >
          Practice
        </span>
        <span
          onClick={() => navigate('/dashboard')}
          style={{ color: 'white', cursor: 'pointer', fontSize: '14px' }}
        >
          Dashboard
        </span>
        <span style={{ color: '#c7d2fe', fontSize: '14px' }}>
          Hi, {user.name || 'User'}!
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'white',
            color: '#4f46e5',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar