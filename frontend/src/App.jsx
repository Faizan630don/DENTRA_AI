import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Upload from './pages/Upload';
import Viewer from './pages/Viewer';
import Dashboard from './pages/Dashboard';
import PatientView from './pages/PatientView';

import History from './pages/History';
import Compare from './pages/Compare';
import CompareResultPage from './pages/CompareResultPage';
import Auth from './pages/Auth';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1a1b1e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }} />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Upload />} />
              <Route path="/viewer" element={<Viewer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patient" element={<PatientView />} />
              <Route path="/history" element={<History />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/compare/result" element={<CompareResultPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
