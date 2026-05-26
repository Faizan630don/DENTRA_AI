/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [mode, setMode] = useState('patient');
  const [scanResult, setScanResult] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  return (
    <AppContext.Provider value={{
      mode, setMode,
      scanResult, setScanResult,
      selectedFinding, setSelectedFinding,
      uploadedFile, setUploadedFile,
      uploadedImageUrl, setUploadedImageUrl,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
