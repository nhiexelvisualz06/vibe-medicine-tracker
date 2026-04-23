import React, { createContext, useContext, useState, useCallback } from 'react';
import { getBasket, updateBasket } from '../utils/pantry';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [db, setDb] = useState(null);           // full Pantry basket
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Load full basket ──
  const loadDb = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBasket();
      setDb(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Save full basket ──
  const saveDb = useCallback(async (newDb) => {
    setLoading(true);
    setError(null);
    try {
      await updateBasket(newDb);
      setDb(newDb);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──
  const login = useCallback(async (username, password) => {
    const data = await loadDb();
    if (!data) throw new Error('Could not reach the server. Check your Pantry ID.');
    const user = data.users?.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) throw new Error('Invalid username or password.');
    setCurrentUser(user);
    return user;
  }, [loadDb]);

  // ── Logout ──
  const logout = useCallback(() => {
    setCurrentUser(null);
    setDb(null);
  }, []);

  // ── Helper: join userMedicines with medicine names for a given userId ──
  const getUserMedicines = useCallback((userId) => {
    if (!db) return [];
    const userMeds = db.userMedicines?.filter((um) => um.userId === userId) ?? [];
    return userMeds.map((um) => {
      const med = db.medicineList?.find((m) => m.medicineId === um.medicineId);
      return { ...um, medicineName: med?.medicineName ?? 'Unknown' };
    });
  }, [db]);

  // ── Helper: get inventory for a medicineId ──
  const getInventory = useCallback((medicineId) => {
    return db?.medicineInventory?.find((i) => i.medicineId === medicineId) ?? null;
  }, [db]);

  return (
    <AppContext.Provider value={{
      db, setDb,
      currentUser, setCurrentUser,
      loading, error, setError,
      loadDb, saveDb,
      login, logout,
      getUserMedicines,
      getInventory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
