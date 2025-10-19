import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' }) // Vite proxy rewrites to backend

function FlyTo({ center }){
  const map = useMap()
  useEffect(()=>{ if (center) map.flyTo([center.lat, center.lon], 12) }, [center])
  return null
}

async function geoSearch(q){
  if (!q || !q.trim()) return []
  try {
    const { data } = await api.get('/geo/search', { params: { q } })
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('geo search failed', e)
    return []
  }
}

export default function MapView({ token, role='regular' }){
  const [from, setFrom] = useState({ name:'Dhaka University', lat:23.7337, lon:90.3929 })
  const [to,   setTo]   = useState({ name:'Hazrat Shahjalal Intl Airport', lat:23.8431, lon:90.3978 })
  const [mode, setMode] = useState('car')

  const [route, setRoute] = useState(null)
  const [pub, setPub]     = useState(null)

  const [fromQuery, setFromQuery] = useState('')
  const [toQuery,   setToQuery]   = useState('')
  const [fromSugs,  setFromSugs]  = useState([])
  const [toSugs,    setToSugs]    = useState([])
  const [busy,      setBusy]      = useState(false)
  const [fromEmpty, setFromEmpty] = useState(false)
  const [toEmpty,   setToEmpty]   = useState(false)

  const headers = useMemo(()=>({ Authorization: 'Bearer ' + token }), [token])

  async function calc(){
    try {
      setBusy(true)
      const [{ data: priv }, { data: pubData }] = await Promise.all([
        api.post('/routes/private-estimate', { from, to, mode }, { headers }),
        api.post('/routes/public-suggest',  { from, to },       { headers })
      ])
      setRoute(priv); setPub(pubData)
    } catch (e) {
      console.error('route error', e)
      alert('Could not calculate route. Check API/proxy and login.')
    } finally { setBusy(false) }
  }
  useEffect(()=>{ calc() }, []) // initial

  // live suggestions (debounced)
  useEffect(()=>{
    const id = setTimeout(async ()=>{
      if (fromQuery.trim().length >= 1) {
        const list = await geoSearch(fromQuery)
        setFromSugs(list); setFromEmpty(list.length === 0)
      } else { setFromSugs([]); setFromEmpty(false) }
    }, 220)
    return ()=>clearTimeout(id)
  }, [fromQuery])

  useEffect(()=>{
    const id = setTimeout(async ()=>{
      if (toQuery.trim().length >= 1) {
        const list = await geoSearch(toQuery)
        setToSugs(list); setToEmpty(list.length === 0)
      } else { setToSugs([]); setToEmpty(false) }
    }, 220)
    return ()=>clearTimeout(id)
  }, [toQuery])

  async function pickFrom(s){
    setFrom({ name:s.name, lat:s.lat, lon:s.lon })
    setFromQuery(s.name)
    setFromSugs([]); setFromEmpty(false)
    await calc()
  }
  async function pickTo(s){
    setTo({ name:s.name, lat:s.lat, lon:s.lon })
    setToQuery(s.name)
    setToSugs([]); setToEmpty(false)
    await calc()
  }

  async function searchFrom(){
    const list = await geoSearch(fromQuery || from.name)
    setFromSugs(list); setFromEmpty(list.length===0)
    if (list[0]) await pickFrom(list[0])
  }
  async function searchTo(){
    const list = await geoSearch(toQuery || to.name)
    setToSugs(list); setToEmpty(list.length===0)
    if (list[0]) await pickTo(list[0])
  }
  function onKeyDown(e, which){ if (e.key === 'Enter') (which==='from'?searchFrom():searchTo()) }

  // ---- this is the function that was missing in your build ----
  async function saveTrip(){
    try {
      await api.post('/routes/trip', {
        from_name: from.name, to_name: to.name, mode,
        cost_min: Math.round(route?.cost_min||0), cost_max: Math.round(route?.cost_max||0),
        duration_min: Math.round(route?.duration_min||0)
      }, { headers })
      alert('Trip saved!')
    } catch (e) { console.error('save trip error', e); alert('Could not save trip.') }
  }

  const panelStyle = {
    position:'absolute', top:16, left:16, zIndex:1500, width:360,
    background:'#fff', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,.15)', padding:12
  }
  const sugBox = {
    position:'relative', zIndex:1600,
    fontSize:12, marginTop:6, maxHeight:220, overflow:'auto',
    background:'#fff', border:'1px solid #eee', borderRadius:8, padding:'6px',
    boxShadow:'0 6px 18px rgba(0,0,0,.12)'
  }
  const noRes = <div style={{padding:'6px 4px', color:'#666'}}>No matches</div>

  return (
    <div style={{position:'relative', height:'100%', width:'100%'}}>
      <div style={panelStyle}>
        <h3 style={{marginTop:0}}>Plan a Trip</h3>

        <div className="field">
          <label>From</label>
          <div className="row">
            <input style={{flex:1}} placeholder="e.g., Dhanmondi 27, New Market"
                   value={fromQuery} onChange={e=>setFromQuery(e.target.value)} onKeyDown={e=>onKeyDown(e,'from')} />
            <button className="btn btn-ghost" onClick={searchFrom}>🔎</button>
          </div>
          {(fromSugs.length>0 || fromEmpty) && (
            <div style={sugBox}>
              {fromSugs.map((s,i)=>(
                <div key={i} style={{cursor:'pointer', padding:'6px 4px', borderBottom:'1px solid #f2f2f2'}}
                     onClick={()=>pickFrom(s)}>{s.name}</div>
              ))}
              {fromEmpty && fromSugs.length===0 ? noRes : null}
            </div>
          )}
        </div>

        <div className="field">
          <label>Destination</label>
          <div className="row">
            <input style={{flex:1}} placeholder="e.g., Motijheel, Uttara North"
                   value={toQuery} onChange={e=>setToQuery(e.target.value)} onKeyDown={e=>onKeyDown(e,'to')} />
            <button className="btn btn-ghost" onClick={searchTo}>🔎</button>
          </div>
          {(toSugs.length>0 || toEmpty) && (
            <div style={sugBox}>
              {toSugs.map((s,i)=>(
                <div key={i} style={{cursor:'pointer', padding:'6px 4px', borderBottom:'1px solid #f2f2f2'}}
                     onClick={()=>pickTo(s)}>{s.name}</div>
              ))}
              {toEmpty && toSugs.length===0 ? noRes : null}
            </div>
          )}
        </div>

        <div className="field">
          <label>Private mode</label>
          <select value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="rickshaw">Rickshaw</option>
            <option value="bike">Bike</option>
            <option value="cab">Cab</option>
            <option value="car">Car</option>
          </select>
        </div>

        <div className="row">
          <button className="btn btn-primary" onClick={calc} disabled={busy}>{busy ? 'Calculating…' : 'Find Routes'}</button>
          <button className="btn btn-ghost" onClick={saveTrip}>Save Trip</button>
        </div>

        {route && <div className="card" style={{marginTop:10}}>
          <h4 style={{margin:'4px 0'}}>Private (Shortest)</h4>
          <div className="row">
            <span className="pill">Time: {Math.round(route.duration_min)} min</span>
            <span className="pill">Dist: {route.distance_km?.toFixed(2)} km</span>
            <span className="pill">BDT {route.cost_min}–{route.cost_max}</span>
          </div>
        </div>}
        {pub && <div className="card" style={{marginTop:10}}>
          <h4 style={{margin:'4px 0'}}>Public Suggestions</h4>
          {pub.fastest ? <div><b>Fastest:</b> {pub.fastest.route.name} ({pub.fastest.route.mode}) · {pub.fastest.duration_min} min · BDT {pub.fastest.cost}</div> : <i>No candidate found</i>}
          {pub.cheapest && pub.cheapest!==pub.fastest ? <div style={{marginTop:4}}><b>Cheapest:</b> {pub.cheapest.route.name} ({pub.cheapest.route.mode}) · {pub.cheapest.duration_min} min · BDT {pub.cheapest.cost}</div> : null}
        </div>}
      </div>

      {/* Map with zoom control on the RIGHT */}
      <MapContainer center={[23.78, 90.40]} zoom={11} zoomControl={false} style={{height:'100%', width:'100%'}}>
        <ZoomControl position="topright" />
        <FlyTo center={{lat:from.lat, lon:from.lon}} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[from.lat, from.lon]} />
        <Marker position={[to.lat, to.lon]} />
        {route?.geometry && <Polyline positions={route.geometry.coordinates.map(c=>[c[1], c[0]])} />}
      </MapContainer>
    </div>
  )
}
