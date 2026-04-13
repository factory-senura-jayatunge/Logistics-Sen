import { describe, it, expect } from "vitest"
import {
  getCoordinatesForLocation,
  interpolateRoute,
  locationCoordinates,
  transportLocations,
} from "@/lib/locations"

describe("locations", () => {
  describe("getCoordinatesForLocation", () => {
    it("returns coordinates for an exact city match", () => {
      const coords = getCoordinatesForLocation("Los Angeles, CA")
      expect(coords).toEqual([34.0522, -118.2437])
    })

    it("returns coordinates for an exact transport location", () => {
      const coords = getCoordinatesForLocation("JFK Airport")
      expect(coords).toEqual([40.6413, -73.7781])
    })

    it("returns coordinates for a partial city match", () => {
      const coords = getCoordinatesForLocation("somewhere in Los Angeles area")
      expect(coords).toEqual([34.0522, -118.2437])
    })

    it("returns coordinates for a partial transport match", () => {
      const coords = getCoordinatesForLocation("near Interstate something")
      expect(coords).toEqual([40.2171, -74.7429])
    })

    it("returns null for unknown location", () => {
      const coords = getCoordinatesForLocation("zzzqqq999")
      expect(coords).toBeNull()
    })

    it("has expected number of city coordinates", () => {
      expect(Object.keys(locationCoordinates).length).toBeGreaterThan(40)
    })

    it("has expected number of transport locations", () => {
      expect(Object.keys(transportLocations).length).toBeGreaterThan(10)
    })
  })

  describe("interpolateRoute", () => {
    it("returns an array starting and ending with given points", () => {
      const start: [number, number] = [0, 0]
      const end: [number, number] = [10, 10]
      const route = interpolateRoute(start, end)
      expect(route[0]).toEqual(start)
      expect(route[route.length - 1]).toEqual(end)
    })

    it("returns correct number of points including start and end", () => {
      const route = interpolateRoute([0, 0], [10, 10])
      expect(route.length).toBeGreaterThan(2)
      expect(route[0]).toEqual([0, 0])
      expect(route[route.length - 1]).toEqual([10, 10])
    })

    it("intermediate points are between start and end", () => {
      const route = interpolateRoute([0, 0], [10, 20])
      for (const point of route) {
        expect(point[0]).toBeGreaterThanOrEqual(0)
        expect(point[0]).toBeLessThanOrEqual(10)
        expect(point[1]).toBeGreaterThanOrEqual(0)
        expect(point[1]).toBeLessThanOrEqual(20)
      }
    })
  })
})
