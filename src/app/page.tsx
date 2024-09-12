// threejs/src/app/page.tsx

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import BackgroundAnimation from './components/BackgroundAnimation';
//import Mfc1 from './components/Mfc1';

const SocialMediaVisualization = dynamic(
  () => import('./components/SocialMediaVisualization'),
  { ssr: false }
);

const SettingsPanel = dynamic(
  () => import('./components/SettingsPanel'),
  { ssr: false }
);

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
    <BackgroundAnimation />
      <SocialMediaVisualization />
     
    </div>
  );
}