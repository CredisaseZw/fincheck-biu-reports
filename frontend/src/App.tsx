import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import type { RouteItem } from "./types/core";
import { CORE_ROUTES } from "./constants/routes";
import { AppLayout } from "./components/layouts/AppLayout";
import Login from "./components/routes/auth/login";

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
      <TooltipProvider >
        <BrowserRouter>
          <Routes>
            <Route path={"/"} element={<Login/>} /> 

            <Route element={<AppLayout />}>
              {renderRoutes(CORE_ROUTES)}
            </Route>
            
            <Route path="*" element={<Navigate to={"/"} replace />} />
          </Routes>
        </BrowserRouter>  
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
