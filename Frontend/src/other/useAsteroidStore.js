// src/other/useAsteroidStore.js
import { create } from "zustand";
import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_API_BASE || "/api/asteroids";

const useAsteroidStore = create((set, get) => ({
  // --- state ---
  type: "C",
  speed: 0,
  distance: 0,
  size: 1,
  damage: 0,
  launched: false,
  xdistance: 100,
  ydistance: 50,
  zdistance: 0,
  launched2: true,
  clicked: true,
  crashed: false,
  orbitpage: true,

  // fetched data
  asteroids: [],
  selectedAsteroid: null,
  loadingAsteroids: false,

  // --- setters ---
  setType: (type) => set({ type }),
  setSpeed: (speed) => set({ speed }),
  setDistance: (distance) => set({ distance }),
  setSize: (size) => set({ size }),
  setDamage: (damage) => set({ damage }),
  setLaunched: (launched) => set({ launched }),
  setX: (xdistance) => set({ xdistance }),
  setY: (ydistance) => set({ ydistance }),
  setZ: (zdistance) => set({ zdistance }),
  setLaunched2: (launched2) => set({ launched2 }),
  setClicked: (clicked) => set({ clicked }),
  setCrashed: (crashed) => set({ crashed }),
  setOrbitpage: (orbitpage) => set({ orbitpage }),

  // --- run simulation ---
  runSimulation: () => {
    const s = get();
    const speed = Number(s.speed) || 0;
    const size = Number(s.size) || 0;
    const computedDistance =
      Number(s.distance) ||
      Math.sqrt(
        (Number(s.xdistance) || 0) ** 2 +
          (Number(s.ydistance) || 0) ** 2 +
          (Number(s.zdistance) || 0) ** 2
      ) ||
      1;

    const typeMultiplier =
      s.type === "A" ? 1.2 : s.type === "B" ? 1.5 : 1;
    const damage =
      ((speed * size) / Math.max(computedDistance, 1)) *
      typeMultiplier;

    set({
      damage,
      launched: true,
      launched2: !s.launched2,
    });

    console.log("runSimulation →", {
      speed,
      size,
      computedDistance,
      damage,
    });

    return damage;
  },

  // --- fetch asteroid list ---
  fetchAsteroids: async () => {
    set({ loadingAsteroids: true });
    try {
      const res = await axios.get(`${BACKEND_BASE}/api/asteroids`);
      set({ asteroids: res.data || [], loadingAsteroids: false });
      console.log(
        `fetchAsteroids: loaded ${res.data?.length ?? 0}`
      );
    } catch (err) {
      console.error("fetchAsteroids error", err);
      set({ loadingAsteroids: false });
    }
  },

  // --- fetch details for a selected asteroid ---
  fetchAsteroidDetails: async (name) => {
    if (!name) return;
    try {
      const res = await axios.get(
        `${BACKEND_BASE}/api/asteroids/${encodeURIComponent(name)}`
      );
      const data = res.data;
      const size = Number(data.size) || 1;

      set({
        selectedAsteroid: data,
        speed: Number(data.speed) || 0,
        size,
        xdistance: 100,
        ydistance: 50,
        zdistance: 0,
        distance: Number(data.missDistance) || 0,
      });

      console.log("fetchAsteroidDetails →", name, {
        speed: data.speed,
        size,
      });
    } catch (err) {
      console.error("fetchAsteroidDetails error", err);
    }
  },
}));

export default useAsteroidStore;
