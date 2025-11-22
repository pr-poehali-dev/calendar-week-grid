import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./utils/errorBoundary";
import { SyncIndicator } from "./components/SyncIndicator";
import { SyncProvider, useSyncContext } from "./context/SyncContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { isSyncing } = useSyncContext();
  
  return (
    <>
      <SyncIndicator isSyncing={isSyncing} />
      <Sonner position="top-center" />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SyncProvider>
        <AppContent />
      </SyncProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;