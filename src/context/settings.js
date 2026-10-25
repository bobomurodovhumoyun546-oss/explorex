import { createContext, useContext } from 'react';

export const SettingsContext = createContext(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings SettingsProvider ichida ishlatilishi kerak');
  return context;
}
