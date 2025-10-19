// backend/src/routes/geo.js
import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    // Nominatim
    const params = new URLSearchParams({
      format: 'json', addressdetails: '1', limit: '8', countrycodes: 'bd', q
    })
    const email = process.env.NOMINATIM_EMAIL || 'route-planner@localhost'
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`
    const r = await fetch(url, { headers: { 'User-Agent': `route-planner/1.0 (${email})`, 'Accept-Language': 'en' } })
    let data = r.ok ? await r.json() : []

    // Fallback to Photon if empty
    if (!Array.isArray(data) || data.length === 0) {
      const u2 = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=en&limit=8&lat=23.78&lon=90.40`
      const r2 = await fetch(u2, { headers: { 'Accept-Language': 'en' } })
      const j2 = r2.ok ? await r2.json() : { features: [] }
      data = (j2.features || []).map(f => ({
        display_name: f.properties?.label,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      }))
    }

    const out = (data || [])
      .map(d => ({ name: d.display_name, lat: +d.lat, lon: +d.lon }))
      .filter(p => p.name && p.lat && p.lon)

    res.set('Cache-Control', 'public, max-age=300')
    res.json(out.slice(0, 8))
  } catch (e) {
    console.error('geo search error', e)
    res.status(500).json({ error: 'geo error' })
  }
})

export default router
