import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import AppRoutes from './routes/AppRoutes';

const getBasename = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/obe')) {
    return '/obe';
  }
  return '/';
};

export default function App() {
  return (
    <AuthProvider>
      <AcademicProvider>
        <BrowserRouter basename={getBasename()}>
          <AppRoutes />
        </BrowserRouter>
      </AcademicProvider>
    </AuthProvider>
  );
}
