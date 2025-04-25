
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StyleProvider } from "./contexts/StyleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NavigationMenu } from "./components/NavigationMenu";

// Pages
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Loading from "./pages/Loading";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StyleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes that don't require subscription */}
              <Route 
                path="/pricing" 
                element={
                  <ProtectedRoute requiresSubscription={false}>
                    <Pricing />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requiresSubscription={false}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes with subscription requirement */}
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/loading" 
                element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Loading />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/results" 
                element={
                  <ProtectedRoute>
                    <NavigationMenu />
                    <Results />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </StyleProvider>
  </QueryClientProvider>
);

export default App;
