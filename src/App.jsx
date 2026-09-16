import { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

const IqacEmmuAssistant = lazy(() => import('./components/emmu/IqacEmmuAssistant'));

export default function App() {
  const isObe = typeof window !== 'undefined' && window.location.pathname.startsWith('/obe');
  const basename = isObe ? '/obe' : '';

  return (
    <ErrorBoundary fallbackTitle="Application Error" fallbackMessage="An unhandled error occurred in the application. Please reload or contact support.">
      <AppProvider>
        <BrowserRouter basename={basename}>
          <AppRoutes />
          <Suspense fallback={null}>
            <IqacEmmuAssistant />
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
