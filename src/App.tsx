import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";

const Work = lazy(() => import("./pages/Work"));
const Collection = lazy(() => import("./pages/Collection"));
const Experience = lazy(() => import("./pages/Experience"));
const Resume = lazy(() => import("./pages/Resume"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Article = lazy(() => import("./pages/Article"));

const queryClient = new QueryClient();

// The router keeps the previous page's scroll position, so every route change starts at the top.
// This includes POP (Back and Forward). Instant, because the site sets scroll-behavior: smooth.
// The ?section= query is not part of pathname, so a section link does not trigger this reset.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" storageKey="theme" enableSystem disableTransitionOnChange>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<Article collection="work" />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/experience/:slug" element={<Article collection="experience" />} />
            <Route path="/writing" element={<Collection />} />
            <Route path="/writing/:slug" element={<Article collection="writing" />} />
            <Route path="/research" element={<Navigate to="/writing?kind=research" replace />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
