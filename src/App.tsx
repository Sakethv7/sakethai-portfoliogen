import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";

const Work = lazy(() => import("./pages/Work"));
const Collection = lazy(() => import("./pages/Collection"));
const Experience = lazy(() => import("./pages/Experience"));
const Resume = lazy(() => import("./pages/Resume"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Article = lazy(() => import("./pages/Article"));

const queryClient = new QueryClient();

// HashRouter keeps the previous page's scroll position, so every route change starts at the top.
// This includes POP: plain <a href="#/..."> links in article Markdown arrive as POP, and the
// browser doesn't restore scroll for hash routes anyway. Instant, because the site sets
// scroll-behavior: smooth.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<Article collection="work" />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/writing" element={<Collection type="writing" />} />
            <Route path="/writing/:slug" element={<Article collection="writing" />} />
            <Route path="/research" element={<Collection type="research" />} />
            <Route path="/notes" element={<Collection type="notes" />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
