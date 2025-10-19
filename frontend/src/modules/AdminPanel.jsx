import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default function AdminPanel({ token }){
  const headers = { Authorization: 'Bearer ' + token }
  const [users, setUsers] = useState([])
  const [pricing, setPricing] = useState([])
  const [routes, setRoutes] = useState({ routes:[], stops:[] })
  const [trips, setTrips] = useState([])

  async function load(){
    const [u,p,r,s] = await Promise.all([
      api.get('/admin/users', { headers }),
      api.get('/admin/pricing', { headers }),
      api.get('/admin/public-routes', { headers }),
      api.get('/stats/trips', { headers }),
    ])
    setUsers(u.data); setPricing(p.data); setRoutes(r.data); setTrips(s.data);
  }
  useEffect(()=>{ load() }, [])

  const [newPricing, setNewPricing] = useState({ mode:'rickshaw', min_per_min:1.5, max_per_min:3 })
  async function savePricing(){
    await api.post('/admin/pricing', newPricing, { headers })
    await load()
  }

  const [newRoute, setNewRoute] = useState({ name:'New Line', mode:'bus', avg_kmh:20, base_cost:10, per_km_cost:2 })
  async function addRoute(){
    await api.post('/admin/public-routes', {...newRoute}, { headers })
    await load()
  }

  return (
    <div className="sidebar">
      <div className="card">
        <h3>Admin Overview</h3>
        <div className="row">
          <span className="pill">Users: {users.length}</span>
          <span className="pill">Trips: {trips.length}</span>
          <span className="pill">Public Routes: {routes.routes.length}</span>
        </div>
      </div>

      <div className="card">
        <h3>Pricing (Private per minute)</h3>
        <div className="row" style={{gap:12, flexWrap:'wrap'}}>
          {pricing.map(p=>(
            <span key={p.mode} className="pill">{p.mode}: {p.min_per_min}-{p.max_per_min}</span>
          ))}
        </div>
        <div className="row">
          <select value={newPricing.mode} onChange={e=>setNewPricing({...newPricing, mode:e.target.value})}>
            <option>rickshaw</option><option>bike</option><option>cab</option><option>car</option>
          </select>
          <input type="number" step="0.1" value={newPricing.min_per_min} onChange={e=>setNewPricing({...newPricing, min_per_min:parseFloat(e.target.value)})} />
          <input type="number" step="0.1" value={newPricing.max_per_min} onChange={e=>setNewPricing({...newPricing, max_per_min:parseFloat(e.target.value)})} />
          <button className="btn btn-primary" onClick={savePricing}>Save</button>
        </div>
      </div>

      <div className="card">
        <h3>Public Transport Routes</h3>
        <div className="row" style={{gap:12, flexWrap:'wrap'}}>
          {routes.routes.map(r=>(<span key={r.id} className="pill">{r.name} ({r.mode})</span>))}
        </div>
        <div className="row">
          <input placeholder="Name" value={newRoute.name} onChange={e=>setNewRoute({...newRoute, name:e.target.value})} />
          <select value={newRoute.mode} onChange={e=>setNewRoute({...newRoute, mode:e.target.value})}>
            <option>bus</option><option>train</option><option>metro</option>
          </select>
          <input type="number" placeholder="avg kmh" value={newRoute.avg_kmh} onChange={e=>setNewRoute({...newRoute, avg_kmh:parseFloat(e.target.value)})} />
          <input type="number" placeholder="base" value={newRoute.base_cost} onChange={e=>setNewRoute({...newRoute, base_cost:parseFloat(e.target.value)})} />
          <input type="number" placeholder="per km" value={newRoute.per_km_cost} onChange={e=>setNewRoute({...newRoute, per_km_cost:parseFloat(e.target.value)})} />
          <button className="btn btn-primary" onClick={addRoute}>Add</button>
        </div>
      </div>

      <div className="card">
        <h3>Recent Trips</h3>
        {trips.slice(0,6).map(t=>(
          <div key={t.id}>#{t.id} • {t.email} • {t.from_name} → {t.to_name} • {t.mode} • {t.duration_min}m • BDT {t.cost_min}-{t.cost_max}</div>
        ))}
      </div>
    </div>
  )
}
