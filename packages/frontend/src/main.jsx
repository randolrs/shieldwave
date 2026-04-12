import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { initAnalytics } from './lib/analytics';
import Landing from './pages/Landing';
import GetQuote from './pages/GetQuote';
import Waitlist from './pages/Waitlist';

initAnalytics();

const GeneralLiability = lazy(() => import('./pages/articles/GeneralLiability'));
const BusinessOwnersPolicy = lazy(() => import('./pages/articles/BusinessOwnersPolicy'));
const WorkersCompensation = lazy(() => import('./pages/articles/WorkersCompensation'));
const CommercialAuto = lazy(() => import('./pages/articles/CommercialAuto'));
const PollutionLiability = lazy(() => import('./pages/articles/PollutionLiability'));
const UmbrellaInsurance = lazy(() => import('./pages/articles/UmbrellaInsurance'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/get-quote" element={<GetQuote />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/insurance/general-liability" element={<GeneralLiability />} />
          <Route path="/insurance/business-owners-policy" element={<BusinessOwnersPolicy />} />
          <Route path="/insurance/workers-compensation" element={<WorkersCompensation />} />
          <Route path="/insurance/commercial-auto" element={<CommercialAuto />} />
          <Route path="/insurance/pollution-liability" element={<PollutionLiability />} />
          <Route path="/insurance/umbrella" element={<UmbrellaInsurance />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
