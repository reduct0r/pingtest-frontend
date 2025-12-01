import { createContext, useContext, useMemo } from 'react';

interface AppInfoContextValue {
  appName: string;
  labGuideUrl: string;
  companyMotto: string;
}

const defaultValue: AppInfoContextValue = {
  appName: 'PINGTEST',
  labGuideUrl: 'https://raw.githubusercontent.com/iu5git/Web/main/tutorials/lab7/README.md',
  companyMotto: 'Снижаем пинг — ускоряем бизнес',
};

const AppInfoContext = createContext<AppInfoContextValue>(defaultValue);

interface Props {
  children: React.ReactNode;
}

export const AppInfoProvider: React.FC<Props> = ({ children }) => {
  const value = useMemo<AppInfoContextValue>(() => defaultValue, []);
  return <AppInfoContext.Provider value={value}>{children}</AppInfoContext.Provider>;
};

export const useAppInfo = () => useContext(AppInfoContext);

