import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import type { RouteItem } from "./types/core";
import { CORE_ROUTES } from "./constants/routes";
import { AppLayout } from "./components/layouts/AppLayout";
import Login from "./components/routes/auth/login";
import { Toaster } from "./components/ui/sonner"
import ReportProvider from "./contexts/ReportMutationContext";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/layouts/PrivateRoute";

function App() {
  const queryClient = new QueryClient();

  function renderRoutes(routes: RouteItem[]) {
    return routes.map(({ link, component: Component, children }) => (
      <Route key={link} path={link} element={Component ? <Component /> : undefined}>
        {children && renderRoutes(children)}
      </Route>
    ))
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ReportProvider>
            <BrowserRouter>
              <Routes>
                <Route path={"/"} element={<Login/>} /> 

                <Route element = {<PrivateRoute/>}>
                  <Route element={<AppLayout />}>
                    {renderRoutes(CORE_ROUTES)}
                  </Route>
                </Route>
                
                <Route path="*" element={<Navigate to={"/"} replace />} />
              </Routes>
            </BrowserRouter>  
            <Toaster
              className={"toast"}
              position="top-left"
              duration={10 * 1000}
            />
            </ReportProvider>
        </TooltipProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
