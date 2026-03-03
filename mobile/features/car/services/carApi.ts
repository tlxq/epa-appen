const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export const fetchMakes = async () => {
  const res = await fetch(`${BASE}/GetAllMakes?format=json`);
  const data = await res.json();

  return data.Results.sort((a: any, b: any) =>
    a.Make_Name.localeCompare(b.Make_Name),
  );
};

export const fetchModelsForMake = async (makeId: number) => {
  const res = await fetch(`${BASE}/GetModelsForMakeId/${makeId}?format=json`);
  const data = await res.json();

  return data.Results.sort((a: any, b: any) =>
    a.Model_Name.localeCompare(b.Model_Name),
  );
};
