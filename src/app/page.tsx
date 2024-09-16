// threejs/src/app/page.tsx

"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import './globals.css';


//import Mfc1 from './components/Mfc1';

const DisasterMovieTimeline = dynamic(
  () => import('./components/disaster'),
  { ssr: false }
);



export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
   
     <DisasterMovieTimeline />
     
    </div>
  );
}