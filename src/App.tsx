
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ServiciosPage from "./pages/ServiciosPage";
import AlmacenamientoPage from "./pages/AlmacenamientoPage";
import ResenasPage from "./pages/ResenasPage";
import QuienesSomosPage from "./pages/QuienesSomosPage";
import ContactanosPage from "./pages/ContactanosPage";
import ConvertirPage from "./pages/ConvertirPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/almacenamiento" element={<AlmacenamientoPage />} />
          <Route path="/resenas" element={<ResenasPage />} />
          <Route path="/quienes-somos" element={<QuienesSomosPage />} />
          <Route path="/contactanos" element={<ContactanosPage />} />
          <Route path="/convertir" element={<ConvertirPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
