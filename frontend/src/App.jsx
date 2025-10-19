import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const api = axios.create({ baseURL: '/api' }) // Vite proxy should rewrite '^/api' to backend

// Simple error boundary so runtime errors don't blank the page
class Boundary extends React.Component {
  constructor(p){ super(p); this.state = { err: null } }
  static getDerivedStateFromError(err){ return { err } }
  componentDidCatch(err, info){ console.error('Render error:', err, info) }
  render(){
    if (this.state.err) {
      return (
        <div style={{ padding: 16 }}>
          <h3 style={{color:'#b00020', marginTop:0}}>Something went wrong</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color:'#b00020' }}>{String(this.state.err)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const MapView    = lazy(() => import('./modules/MapView.jsx'))
const AdminPanel = lazy(() => import('./modules/AdminPanel.jsx'))

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const i=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(i) }, [])
  return <span>{now.toLocaleDateString()} {now.toLocaleTimeString()}</span>
}

export default function App() {
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState('regular')
  const [remember, setRemember] = useState(false)

  const user = useMemo(() => {
    if (!token) return null
    try { return jwtDecode(token) } catch { return null }
  }, [token])

  // Always start on Login. Only auto-login if remember=1 and token valid.
  useEffect(() => {
    const remembered = localStorage.getItem('remember') === '1'
    if (!remembered) return
    const t = localStorage.getItem('token')
    if (!t) return
    try {
      const { exp, role } = jwtDecode(t)
      if (!exp || exp * 1000 > Date.now()) {
        setToken(t); setProfile(role || 'regular'); setRemember(true)
      } else {
        localStorage.removeItem('token'); localStorage.removeItem('remember')
      }
    } catch {
      localStorage.removeItem('token'); localStorage.removeItem('remember')
    }
  }, [])

  async function login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      if (remember) localStorage.setItem('remember', '1')
      else localStorage.removeItem('remember')
      setToken(data.token)
      setProfile(data.user.role)
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Login failed'
      alert('Login error: ' + msg)
      console.error('Login error:', err)
    }
  }

  function logout(){
    localStorage.removeItem('token'); localStorage.removeItem('remember')
    setToken(null); setProfile('regular'); setRemember(false)
  }

  return (
    <Boundary>
      <div className="app">
        <div className="topbar">
          <div className="brand">Route Planner</div>
          <div className="row">
            <Clock />
            {user && <span className={'role-badge ' + (profile==='admin'?'admin':'regular')}>{profile.toUpperCase()}</span>}
            {user ? <button className="btn btn-ghost" onClick={logout}>Logout</button> : null}
          </div>
        </div>

        {!user ? (
          <Login onLogin={login} setProfile={setProfile} remember={remember} setRemember={setRemember} />
        ) : (
          profile === 'admin'
          ? (
            <div className="panel">
              <Suspense fallback={<div className="sidebar"><div className="card">Loading admin…</div></div>}>
                <AdminPanel token={token} />
              </Suspense>
              <Suspense fallback={<div className="sidebar"><div className="card">Loading map…</div></div>}>
                <MapView token={token} role="admin" />
              </Suspense>
            </div>
          )
          : (
            <div style={{height:'calc(100vh - 64px)'}}>
              <Suspense fallback={<div className="sidebar"><div className="card">Loading map…</div></div>}>
                <MapView token={token} role="regular" />
              </Suspense>
            </div>
          )
        )}
      </div>
    </Boundary>
  )
}

/* ---------- New Login (matches your Freepik layout, no background image) ---------- */
function Login({ onLogin, setProfile, remember, setRemember }) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => { setProfile(isAdmin ? 'admin' : 'regular') }, [isAdmin])
  function onEnter(e){ if (e.key === 'Enter') onLogin(email, password) }

  const page = { display:'grid', gridTemplateColumns:'1.25fr 1fr', height:'calc(100vh - 64px)' }

  // Left side = gradient panel (no image)
  const left = {
    background: 'linear-gradient(135deg,#7c3aed, #0ea5e9)',
    color:'#fff', display:'grid', placeItems:'center', padding:'48px'
  }
  const leftInner = { maxWidth:560 }
  const right = { display:'grid', placeItems:'center', background:'#fff' }
  const card = { width:380, background:'#fff', borderRadius:16, boxShadow:'0 24px 60px rgba(0,0,0,.15)', padding:24 }

  return (
    <div style={page}>
      <div style={left}>
        <div style={leftInner}>
          <h1 style={{fontSize:44, lineHeight:1.1, margin:'0 0 12px'}}>Welcome to Route Planner</h1>
          <p style={{opacity:.95, fontSize:18}}>
            Plan time- and cost-efficient trips across Dhaka. Multi-modal routes
            with private and public transport in one place.
          </p>
        </div>
      </div>

      <div style={right}>
        <div style={card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:16}}>User Login</h2>

          <div className="field"><label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={onEnter} />
          </div>

          <div className="field"><label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={onEnter} />
          </div>

          <div className="row" style={{justifyContent:'space-between'}}>
            <label className="row" style={{gap:8, alignItems:'center'}}>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" onClick={e=>e.preventDefault()} style={{fontSize:12, opacity:.7}}>Forgot password?</a>
          </div>

          <div className="field" style={{marginTop:12}}><label>Profile</label>
            <div className="row">
              <button className={'btn '+(isAdmin?'btn-primary':'btn-ghost')}
                onClick={()=>{ setIsAdmin(true); setEmail('admin@example.com'); setPassword('admin123') }}>Admin</button>
              <button className={'btn '+(!isAdmin?'btn-primary':'btn-ghost')}
                onClick={()=>{ setIsAdmin(false); setEmail('user@example.com'); setPassword('user123') }}>Regular</button>
            </div>
          </div>

          <div className="row" style={{justifyContent:'center'}}>
            <button className="btn btn-primary" onClick={()=>onLogin(email, password)} style={{minWidth:140}}>Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}
