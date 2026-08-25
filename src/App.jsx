import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  const isNba = typeof window !== 'undefined' && window.location.pathname.startsWith('/nba');
  const basename = isNba ? '/nba' : '';

  return (
    <ErrorBoundary fallbackTitle="Application Error" fallbackMessage="An unhandled error occurred in the application. Please reload or contact support.">
      <AppProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
