/**
 * Moon distance calculation.
 * Currently returns the average Earth–Moon distance.
 *
 * Future: integrate with an ephemeris or lunar distance API
 * (e.g. NASA Horizons, astronomy APIs) for real-time distance.
 */

const AVERAGE_MOON_DISTANCE_KM = 384_400;

/**
 * Returns the current distance to the Moon in kilometers.
 * For now returns the average distance; can be replaced with API data later.
 */
export function calculateMoonDistance(): number {
  return AVERAGE_MOON_DISTANCE_KM;
}
