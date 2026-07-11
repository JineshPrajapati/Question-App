import "./App.css";
import { APP_CONFIG } from "../project.config";
import MyRoutes from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "./components/ui/Toast";
import "react-toastify/dist/ReactToastify.css";
// import 'react-loading-skeleton/dist/skeleton.css'
import AuthProvider from "./contexts/authContext";
import { DropdownProvider } from "./contexts/dropdownContext";
import GlobalDropdown from "./app/components/common/GlobalDropdown";
// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <DropdownProvider>
            <MyRoutes />
            <ToastProvider />
            <GlobalDropdown />
          </DropdownProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
