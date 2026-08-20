import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Error" fallbackMessage="An unhandled error occurred in the application. Please reload or contact support.">
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
