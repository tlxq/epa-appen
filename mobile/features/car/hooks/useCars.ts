import { useState, useCallback } from 'react';
import { fetchMakes, fetchModelsForMake } from '../services/carApi';

export function useCars() {
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMakes = useCallback(async () => {
    setLoading(true);
    const m = await fetchMakes();
    setMakes(m);
    setLoading(false);
  }, []);

  const loadModels = useCallback(async (makeId: number) => {
    setLoading(true);
    const m = await fetchModelsForMake(makeId);
    setModels(m);
    setLoading(false);
  }, []);

  return { makes, models, loadMakes, loadModels, loading };
}
