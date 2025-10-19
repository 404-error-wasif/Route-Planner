import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export default function AdminPanel({ token }){
  const headers = { Authorization: 'Bearer ' + token }
  const [users, setUsers] = useState([])
  const [pricing, setPricing] = useState([])
  const [routes, setRoutes] = useState({ routes:[], stops:[] })
  const [trips, setTrips] = useState([])

  // state for creating a new public transport route
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteType, setNewRouteType] = useState('bus')
  const [newRouteCost, setNewRouteCost] = useState('')
  const [firstStopQuery, setFirstStopQuery] = useState('')
  const [lastStopQuery, setLastStopQuery]   = useState('')
  const [firstStopSugs, setFirstStopSugs]   = useState([])
  const [lastStopSugs, setLastStopSugs]     = useState([])
  const [firstStopSelected, setFirstStopSelected] = useState(null)
  const [lastStopSelected, setLastStopSelected]   = useState(null)
  const [firstStopEmpty, setFirstStopEmpty] = useState(false)
  const [lastStopEmpty, setLastStopEmpty]   = useState(false)

  // state for adding stops to an existing route
  const [currentRouteId, setCurrentRouteId] = useState(null)
  const [nextSeq, setNextSeq] = useState(3) // seq for additional stops (first two are 1 & 2)
  const [newStopQuery, setNewStopQuery] = useState('')
  const [newStopSugs, setNewStopSugs]   = useState([])
  const [newStopSelected, setNewStopSelected] = useState(null)
  const [newStopEmpty, setNewStopEmpty] = useState(false)

  // state for blocking routes
  const [blockFromQuery, setBlockFromQuery] = useState('')
  const [blockToQuery,   setBlockToQuery]   = useState('')
  const [blockFromSugs,  setBlockFromSugs]  = useState([])
  const [blockToSugs,    setBlockToSugs]    = useState([])
  const [blockFromSelected, setBlockFromSelected] = useState(null)
  const [blockToSelected,   setBlockToSelected]   = useState(null)
  const [blockFromEmpty, setBlockFromEmpty] = useState(false)
  const [blockToEmpty,   setBlockToEmpty]   = useState(false)

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

  // We no longer use the old newRoute/newRoute form; route creation is handled by
  // createPublicRoute() using first/last stop selections.

  // Debounced search for geo names
  async function geoSearch(q) {
    if (!q || !q.trim()) return []
    try {
      const { data } = await api.get('/geo/search', { params: { q } })
      return Array.isArray(data) ? data : []
    } catch (e) {
      console.error('geo search failed', e)
      return []
    }
  }

  // useRefs for debounce timers to avoid stale closures
  const firstTimer = useRef(null)
  const lastTimer  = useRef(null)
  const newStopTimer = useRef(null)
  const blockFromTimer = useRef(null)
  const blockToTimer   = useRef(null)

  // Effects to fetch suggestions for first/last stop when queries change
  useEffect(() => {
    clearTimeout(firstTimer.current)
    firstTimer.current = setTimeout(async () => {
      if (firstStopQuery.trim().length >= 1) {
        const list = await geoSearch(firstStopQuery)
        setFirstStopSugs(list); setFirstStopEmpty(list.length === 0)
      } else {
        setFirstStopSugs([]); setFirstStopEmpty(false)
      }
    }, 250)
    return () => clearTimeout(firstTimer.current)
  }, [firstStopQuery])

  useEffect(() => {
    clearTimeout(lastTimer.current)
    lastTimer.current = setTimeout(async () => {
      if (lastStopQuery.trim().length >= 1) {
        const list = await geoSearch(lastStopQuery)
        setLastStopSugs(list); setLastStopEmpty(list.length === 0)
      } else {
        setLastStopSugs([]); setLastStopEmpty(false)
      }
    }, 250)
    return () => clearTimeout(lastTimer.current)
  }, [lastStopQuery])

  useEffect(() => {
    clearTimeout(newStopTimer.current)
    newStopTimer.current = setTimeout(async () => {
      if (newStopQuery.trim().length >= 1) {
        const list = await geoSearch(newStopQuery)
        setNewStopSugs(list); setNewStopEmpty(list.length === 0)
      } else {
        setNewStopSugs([]); setNewStopEmpty(false)
      }
    }, 250)
    return () => clearTimeout(newStopTimer.current)
  }, [newStopQuery])

  useEffect(() => {
    clearTimeout(blockFromTimer.current)
    blockFromTimer.current = setTimeout(async () => {
      if (blockFromQuery.trim().length >= 1) {
        const list = await geoSearch(blockFromQuery)
        setBlockFromSugs(list); setBlockFromEmpty(list.length === 0)
      } else {
        setBlockFromSugs([]); setBlockFromEmpty(false)
      }
    }, 250)
    return () => clearTimeout(blockFromTimer.current)
  }, [blockFromQuery])

  useEffect(() => {
    clearTimeout(blockToTimer.current)
    blockToTimer.current = setTimeout(async () => {
      if (blockToQuery.trim().length >= 1) {
        const list = await geoSearch(blockToQuery)
        setBlockToSugs(list); setBlockToEmpty(list.length === 0)
      } else {
        setBlockToSugs([]); setBlockToEmpty(false)
      }
    }, 250)
    return () => clearTimeout(blockToTimer.current)
  }, [blockToQuery])

  // Handlers for selecting suggestions
  function selectFirst(s) {
    setFirstStopSelected(s)
    setFirstStopQuery(s.name)
    setFirstStopSugs([])
    setFirstStopEmpty(false)
  }
  function selectLast(s) {
    setLastStopSelected(s)
    setLastStopQuery(s.name)
    setLastStopSugs([])
    setLastStopEmpty(false)
  }
  function selectNewStop(s) {
    setNewStopSelected(s)
    setNewStopQuery(s.name)
    setNewStopSugs([])
    setNewStopEmpty(false)
  }
  function selectBlockFrom(s) {
    setBlockFromSelected(s)
    setBlockFromQuery(s.name)
    setBlockFromSugs([])
    setBlockFromEmpty(false)
  }
  function selectBlockTo(s) {
    setBlockToSelected(s)
    setBlockToQuery(s.name)
    setBlockToSugs([])
    setBlockToEmpty(false)
  }

  // Function to compute a simple haversine distance (approximate)
  function haversineDistance(a, b) {
    const R = 6371
    const dLat = (b.lat - a.lat) * Math.PI / 180
    const dLon = (b.lon - a.lon) * Math.PI / 180
    const lat1 = a.lat * Math.PI / 180
    const lat2 = b.lat * Math.PI / 180
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
  }

  // Create a new public route with the first and last stops
  async function createPublicRoute() {
    if (!newRouteName.trim() || !firstStopSelected || !lastStopSelected || !newRouteCost) {
      alert('Please provide route name, cost and select both first and last places.')
      return
    }
    try {
      // Compute a rough per-km cost based on user input and straight-line distance
      const costValue = parseFloat(newRouteCost)
      const distance = haversineDistance(firstStopSelected, lastStopSelected) || 1
      const perKmCost = costValue / distance
      const baseCost = costValue * 0.3
      const payload = {
        name: newRouteName,
        mode: newRouteType,
        avg_kmh: 18,
        base_cost: baseCost,
        per_km_cost: perKmCost
      }
      // create the route
      const { data } = await api.post('/admin/public-routes', payload, { headers })
      const rid = data.id
      // insert first stop
      await api.post(`/admin/public-routes/${rid}/stops`, {
        name: firstStopSelected.name,
        lat: firstStopSelected.lat,
        lon: firstStopSelected.lon,
        seq: 1
      }, { headers })
      // insert last stop
      await api.post(`/admin/public-routes/${rid}/stops`, {
        name: lastStopSelected.name,
        lat: lastStopSelected.lat,
        lon: lastStopSelected.lon,
        seq: 2
      }, { headers })
      setCurrentRouteId(rid)
      setNextSeq(3)
      alert('New route created! You can now add intermediate stops if needed.')
      // reload list of routes
      await load()
    } catch (e) {
      console.error('failed to create route', e)
      alert('Could not create route.')
    }
  }

  // Add an intermediate stop to the current route
  async function addIntermediateStop() {
    if (!currentRouteId) {
      alert('No route selected. Please create a route first.')
      return
    }
    if (!newStopSelected) {
      alert('Please select a place for the new stop.')
      return
    }
    try {
      await api.post(`/admin/public-routes/${currentRouteId}/stops`, {
        name: newStopSelected.name,
        lat: newStopSelected.lat,
        lon: newStopSelected.lon,
        seq: nextSeq
      }, { headers })
      setNextSeq(nextSeq + 1)
      setNewStopSelected(null)
      setNewStopQuery('')
      alert('Stop added to route.')
      await load()
    } catch (e) {
      console.error('failed to add stop', e)
      alert('Could not add stop.')
    }
  }

  // Create a blocked segment between two places
  async function createBlock() {
    if (!blockFromSelected || !blockToSelected) {
      alert('Please select both start and end places to block.')
      return
    }
    try {
      const geometry = {
        type: 'LineString',
        coordinates: [
          [blockFromSelected.lon, blockFromSelected.lat],
          [blockToSelected.lon,   blockToSelected.lat]
        ]
      }
      await api.post('/admin/blocks', {
        name: `${blockFromSelected.name} → ${blockToSelected.name}`,
        geometry,
        start_time: null,
        end_time: null
      }, { headers })
      alert('Route segment blocked.')
    } catch (e) {
      console.error('failed to block segment', e)
      alert('Could not block segment.')
    }
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
        <h3>Create Public Transport Route</h3>
        <div className="row" style={{flexWrap:'wrap', gap:8}}>
          <input style={{flex:1}} placeholder="Route name" value={newRouteName} onChange={e=>setNewRouteName(e.target.value)} />
          <select value={newRouteType} onChange={e=>setNewRouteType(e.target.value)}>
            <option>bus</option><option>train</option><option>metro</option>
          </select>
          <input type="number" placeholder="Cost to last stop" value={newRouteCost} onChange={e=>setNewRouteCost(e.target.value)} />
        </div>
        <div className="field" style={{marginTop:8}}>
          <label>First place</label>
          <input style={{width:'100%'}} placeholder="Start location" value={firstStopQuery} onChange={e=>setFirstStopQuery(e.target.value)} />
          {(firstStopSugs.length>0 || firstStopEmpty) && (
            <div style={{position:'relative', background:'#fff', border:'1px solid #eee', borderRadius:6, maxHeight:150, overflow:'auto', zIndex:2000}}>
              {firstStopSugs.map((s,i)=>(
                <div key={i} style={{padding:'4px 6px', cursor:'pointer', borderBottom:'1px solid #f2f2f2'}} onClick={()=>selectFirst(s)}>{s.name}</div>
              ))}
              {firstStopEmpty && firstStopSugs.length===0 ? <div style={{padding:'4px 6px', color:'#666'}}>No matches</div> : null}
            </div>
          )}
        </div>
        <div className="field" style={{marginTop:8}}>
          <label>Last place</label>
          <input style={{width:'100%'}} placeholder="End location" value={lastStopQuery} onChange={e=>setLastStopQuery(e.target.value)} />
          {(lastStopSugs.length>0 || lastStopEmpty) && (
            <div style={{position:'relative', background:'#fff', border:'1px solid #eee', borderRadius:6, maxHeight:150, overflow:'auto', zIndex:2000}}>
              {lastStopSugs.map((s,i)=>(
                <div key={i} style={{padding:'4px 6px', cursor:'pointer', borderBottom:'1px solid #f2f2f2'}} onClick={()=>selectLast(s)}>{s.name}</div>
              ))}
              {lastStopEmpty && lastStopSugs.length===0 ? <div style={{padding:'4px 6px', color:'#666'}}>No matches</div> : null}
            </div>
          )}
        </div>
        <div className="row" style={{marginTop:8}}>
          <button className="btn btn-primary" onClick={createPublicRoute}>Create Route</button>
          {currentRouteId && <span className="pill">Current route ID: {currentRouteId}</span>}
        </div>
        {currentRouteId && (
          <div style={{marginTop:12}}>
            <h4 style={{margin:'4px 0'}}>Add intermediate stop</h4>
            <input style={{width:'100%'}} placeholder="Intermediate stop" value={newStopQuery} onChange={e=>setNewStopQuery(e.target.value)} />
            {(newStopSugs.length>0 || newStopEmpty) && (
              <div style={{position:'relative', background:'#fff', border:'1px solid #eee', borderRadius:6, maxHeight:150, overflow:'auto', zIndex:2000}}>
                {newStopSugs.map((s,i)=>(
                  <div key={i} style={{padding:'4px 6px', cursor:'pointer', borderBottom:'1px solid #f2f2f2'}} onClick={()=>selectNewStop(s)}>{s.name}</div>
                ))}
                {newStopEmpty && newStopSugs.length===0 ? <div style={{padding:'4px 6px', color:'#666'}}>No matches</div> : null}
              </div>
            )}
            <div className="row" style={{marginTop:6}}>
              <button className="btn btn-primary" onClick={addIntermediateStop}>Add Stop</button>
            </div>
          </div>
        )}
        <div style={{marginTop:12}}>
          <h4 style={{margin:'4px 0'}}>Block a route segment</h4>
          <input style={{width:'100%', marginBottom:4}} placeholder="Block from" value={blockFromQuery} onChange={e=>setBlockFromQuery(e.target.value)} />
          {(blockFromSugs.length>0 || blockFromEmpty) && (
            <div style={{position:'relative', background:'#fff', border:'1px solid #eee', borderRadius:6, maxHeight:150, overflow:'auto', zIndex:2000}}>
              {blockFromSugs.map((s,i)=>(
                <div key={i} style={{padding:'4px 6px', cursor:'pointer', borderBottom:'1px solid #f2f2f2'}} onClick={()=>selectBlockFrom(s)}>{s.name}</div>
              ))}
              {blockFromEmpty && blockFromSugs.length===0 ? <div style={{padding:'4px 6px', color:'#666'}}>No matches</div> : null}
            </div>
          )}
          <input style={{width:'100%', marginTop:6, marginBottom:4}} placeholder="Block to" value={blockToQuery} onChange={e=>setBlockToQuery(e.target.value)} />
          {(blockToSugs.length>0 || blockToEmpty) && (
            <div style={{position:'relative', background:'#fff', border:'1px solid #eee', borderRadius:6, maxHeight:150, overflow:'auto', zIndex:2000}}>
              {blockToSugs.map((s,i)=>(
                <div key={i} style={{padding:'4px 6px', cursor:'pointer', borderBottom:'1px solid #f2f2f2'}} onClick={()=>selectBlockTo(s)}>{s.name}</div>
              ))}
              {blockToEmpty && blockToSugs.length===0 ? <div style={{padding:'4px 6px', color:'#666'}}>No matches</div> : null}
            </div>
          )}
          <div className="row" style={{marginTop:6}}>
            <button className="btn btn-primary" onClick={createBlock}>Block Segment</button>
          </div>
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
