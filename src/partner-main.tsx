import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import './index.css';
import PartnerLandingPage from './pages/partner/PartnerLandingPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PartnerLandingPage />
  </StrictMode>
);
