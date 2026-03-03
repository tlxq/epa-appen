const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

// Module-level caches — survives re-renders and screen remounts
let makesCache: any[] | null = null;
const modelsCache = new Map<number, any[]>();

export const fetchMakes = async () => {
  if (makesCache) return makesCache;
  const res = await fetch(`${BASE}/GetAllMakes?format=json`);
  const data = await res.json();
  makesCache = data.Results.sort((a: any, b: any) =>
    a.Make_Name.localeCompare(b.Make_Name),
  );
  return makesCache!;
};

export const fetchModelsForMake = async (makeId: number) => {
  if (modelsCache.has(makeId)) return modelsCache.get(makeId)!;
  const res = await fetch(`${BASE}/GetModelsForMakeId/${makeId}?format=json`);
  const data = await res.json();
  const sorted = data.Results.sort((a: any, b: any) =>
    a.Model_Name.localeCompare(b.Model_Name),
  );
  modelsCache.set(makeId, sorted);
  return sorted;
};
