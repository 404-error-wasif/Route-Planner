// src/seed/loadPublicTransport.js
//
// This module seeds the public transport tables with a set of Dhaka city bus
// routes and stops. It reads a JSON file generated from the provided text
// dataset and inserts each route along with its stops. The function is
// designed to be idempotent; if a route with the same name already
// exists in the database, it will skip inserting it again. This script
// should be invoked on server startup to ensure the database always
// contains the latest public transport definitions.

import fs from 'fs/promises'
import path from 'path'
import { pool } from '../../db.js'

/**
 * Load public transport routes from the local JSON file and insert them into
 * the public_routes and public_route_stops tables. Existing routes with the
 * same name are skipped. Stops are inserted only if the route was newly
 * created. Geometry is stored as a JSON string on the route record.
 */
export async function loadPublicTransport() {
  try {
    const filePath = path.resolve('src/seed/data/dhaka_public_routes.json')
    const content = await fs.readFile(filePath, 'utf8')
    const routes = JSON.parse(content)

    for (const r of routes) {
      // Check whether this route already exists (by name). If it does,
      // retrieve the id; otherwise insert a new record.
      const [existing] = await pool.query('SELECT id FROM public_routes WHERE name = ?', [r.name])
      let routeId
      if (existing.length > 0) {
        routeId = existing[0].id
      } else {
        const [res] = await pool.query(
          'INSERT INTO public_routes (name, mode, avg_kmh, base_cost, per_km_cost, geometry) VALUES (?,?,?,?,?,?)',
          [r.name, r.mode, r.avg_kmh, r.base_cost, r.per_km_cost, JSON.stringify(r.geometry)]
        )
        routeId = res.insertId
      }
      // If the route is newly inserted, insert its stops. We assume that
      // each route's stops are unique by seq per route. If the route
      // previously existed we skip inserting stops to avoid duplication.
      if (existing.length === 0) {
        for (const stop of r.stops) {
          await pool.query(
            'INSERT INTO public_route_stops (route_id, name, lat, lon, seq) VALUES (?,?,?,?,?)',
            [routeId, stop.name, stop.lat, stop.lon, stop.seq]
          )
        }
      }
    }
    return { inserted: routes.length }
  } catch (err) {
    console.error('Error loading public transport data', err)
    throw err
  }
}