import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import RoutesComponent from './app';
import { AuthProvider } from '@/runtime/auth';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000, refetchInterval: 30_000 } },
});

function MainApp() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
          <TooltipProvider>
            <ErrorBoundary fallbackRender={({ resetErrorBoundary }) => (
              <main className="mx-auto max-w-xl p-8 text-center">
                <h1 className="text-xl font-bold">页面暂时无法显示</h1>
                <p className="my-4 text-sm text-muted-foreground">请重试，原方案资料不会受到影响。</p>
                <button onClick={resetErrorBoundary} className="bg-primary px-4 py-2 text-primary-foreground">重新加载</button>
              </main>
            )}>
              <AuthProvider><RoutesComponent /></AuthProvider>
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<MainApp />);
