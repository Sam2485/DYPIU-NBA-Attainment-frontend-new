import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AcademicProvider } from './context/AcademicContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <AcademicProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AcademicProvider>
    </AuthProvider>
  );
}
