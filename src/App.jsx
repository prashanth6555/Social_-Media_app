import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Toaster } from "./components/ui/Toaster";
import { StoreProvider, useStore } from "./context/Store";
import { AuthPage } from "./pages/AuthPage";
import { Explore } from "./pages/Explore";
import { Home } from "./pages/Home";
import { Messages } from "./pages/Messages";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";

function Guard() {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function Guest() {
  const { user } = useStore();
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Guest />} />
          <Route path="/signup" element={<Guest />} />
          <Route element={<Guard />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:chatId" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </StoreProvider>
  );
}
