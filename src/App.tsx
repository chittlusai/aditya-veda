import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import TopNavLayout from './components/TopNavLayout';
import SidebarLayout from './components/SidebarLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerify from './pages/OtpVerify';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UrlScan from './pages/UrlScan';
import MessageScan from './pages/MessageScan';
import QrScan from './pages/QrScan';
import ImageScan from './pages/ImageScan';
import ScansList from './pages/ScansList';
import Threats from './pages/Threats';
import Safety from './pages/Safety';
import WebsiteScan from './pages/WebsiteScan';
import SocialScan from './pages/SocialScan';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}

function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  // If the user is already logged in, return directly to dashboard or target tool
  if (isAuthenticated) {
    const destination = redirect ? decodeURIComponent(redirect) : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return <TopNavLayout>{children}</TopNavLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <TopNavLayout>{children}</TopNavLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Public) */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Guest-only Authentication Routes (Redirects to /dashboard if already logged in) */}
        <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
        <Route path="/signup" element={<GuestOnlyRoute><Signup /></GuestOnlyRoute>} />
        <Route path="/otp-verify" element={<GuestOnlyRoute><OtpVerify /></GuestOnlyRoute>} />

        {/* Protected Security Tools & Scanners (Redirects to /login if not authenticated) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/scans" element={<ProtectedRoute><ScansList /></ProtectedRoute>} />
        <Route path="/threats" element={<ProtectedRoute><Threats /></ProtectedRoute>} />
        <Route path="/safety" element={<ProtectedRoute><Safety /></ProtectedRoute>} />
        <Route path="/scan/url" element={<ProtectedRoute><UrlScan /></ProtectedRoute>} />
        <Route path="/scan/message" element={<ProtectedRoute><MessageScan /></ProtectedRoute>} />
        <Route path="/scan/qr" element={<ProtectedRoute><QrScan /></ProtectedRoute>} />
        <Route path="/scan/screenshot" element={<ProtectedRoute><ImageScan /></ProtectedRoute>} />
        <Route path="/scan/website" element={<ProtectedRoute><WebsiteScan /></ProtectedRoute>} />
        <Route path="/scan/social" element={<ProtectedRoute><SocialScan /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<PublicRoute><div className="p-10 text-center text-xl font-bold">404 - Not Found</div></PublicRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
