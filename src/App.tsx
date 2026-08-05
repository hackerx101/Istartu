import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Home from './pages/Home';
import Offers from './pages/Offers';
import Chat from './pages/Chat';
import Events from './pages/Events';
import Settings from './pages/Settings';
import Certificate from './pages/Certificate';
import PlayerProfile from './pages/PlayerProfile';
import Subscriptions from './pages/Subscriptions';
import Checkout from './pages/Checkout';
import PostView from './pages/PostView';
import GarexcellLogin from './pages/Auth/GarexcellLogin';
import GarexcellAuthPage from './pages/Auth/GarexcellAuthPage';

// New features
import TeamJoin from './pages/TeamJoin';
import LiveStart from './pages/LiveStart';
import LiveInvite from './pages/LiveInvite';
import Referral from './pages/Referral';
import Rankings from './pages/Rankings';
import WalletTopup from './pages/WalletTopup';
import RequestCredits from './pages/RequestCredits';
import CheckoutOrder from './pages/CheckoutOrder';

// Recruits & Ads
import RecruitsLanding from './pages/Recruits/Landing';
import RecruitsAuth from './pages/Recruits/Auth';
import RecruitsDashboard from './pages/Recruits/Dashboard';
import TeamView from './pages/Recruits/TeamView';
import AdCreate from './pages/AdCreate';
import AdView from './pages/AdView';

import TOS from './pages/TOS';
import Privacy from './pages/Privacy';
import PartnerRequest from './pages/PartnerRequest';
import Partners from './pages/Partners';
import RedirectPage from './pages/RedirectPage';
import PlayerCardAI from './pages/PlayerCardAI';
import TestDemo from './pages/TestDemo';
import TVRedirect from './pages/TVRedirect';

// iStartU Main App Routes
export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/signup" element={<Signup />} />
          
          <Route path="tos" element={<TOS />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="partner/request" element={<PartnerRequest />} />
          <Route path="partners" element={<Partners />} />
          <Route path="i/redirect" element={<RedirectPage />} />
          <Route path="auth/forgot-password" element={<ForgotPassword />} />
          <Route path="login/auth/client_id" element={<GarexcellLogin />} />
          <Route path="login/garexcell/auth" element={<GarexcellAuthPage />} />
          
          <Route path="home" element={<Home />} />
          <Route path="offers" element={<Offers />} />
          <Route path="chat" element={<Chat />} />
          <Route path="events" element={<Events />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/:tab" element={<Settings />} />
          <Route path="plans/subscription" element={<Subscriptions />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="wallet/topup" element={<WalletTopup />} />
          <Route path="request/credits/:PlayerId" element={<RequestCredits />} />
          <Route path="checkout/order/:SessionId" element={<CheckoutOrder />} />
          
          <Route path="join/team" element={<TeamJoin />} />
          <Route path="live/start" element={<LiveStart />} />
          <Route path="live/invite/:LiveId" element={<LiveInvite />} />
          <Route path="tv" element={<TVRedirect />} />
          <Route path="refer/:PlayerId" element={<Referral />} />
          <Route path="rankings" element={<Rankings />} />
          
          <Route path="certificate/view/:PlayerId" element={<Certificate />} />
          <Route path="player/:PlayerId" element={<PlayerProfile />} />
          <Route path="player/card/:PlayerId" element={<PlayerCardAI />} />
          <Route path="post/:PostId" element={<PostView />} />
          
          <Route path="recruits" element={<RecruitsLanding />} />
          <Route path="recruits/auth" element={<RecruitsAuth />} />
          <Route path="recruits/dashboard" element={<RecruitsDashboard />} />
          <Route path="recruits/team/:TeamId" element={<TeamView />} />
          <Route path="ad/create" element={<AdCreate />} />
          <Route path="ad/:PostId" element={<AdView />} />
          
          <Route path="test/10027189" element={<TestDemo />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
    </HelmetProvider>
  );
}
