// Where the camera is for a given scroll progress, and where the stations of the tour sit in 3D space.
export const camZ = (p) => (p < 0.25 ? 10 : p < 0.75 ? 10 - ((p - 0.25) / 0.5) * 110 : -100)
export const STATIONS = [0.31, 0.42, 0.53, 0.64, 0.75]
export const STATION_Z = STATIONS.map((c) => camZ(c) - 8)
export const SPHERE_C = [3.0, 0, -114]
export const FINAL = [2.9, -0.3, -110]
export const PORTRAIT_H = 8.5
// stage windows on the scroll track
export const T1 = [0.085, 0.26] // portrait → tunnel (shatter)
export const T2 = [0.76, 0.83] // tunnel → sphere
export const T3 = [0.89, 0.95] // sphere → portrait again
