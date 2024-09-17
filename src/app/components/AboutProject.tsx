// src/app/components/AboutProject.tsx
import React, { useEffect, useState } from 'react';

const AboutProject: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Match this with your transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const aboutText = `In the grand theater of cinema, disaster movies are my guilty pleasure turned scholarly pursuit. Like a cinephile Nostradamus, I've set out to map the ebb and flow of our collective anxieties through the lens of Hollywood catastrophe.

  From rampaging monsters to climate calamities, each era's on-screen disasters mirror our societal fears with uncanny precision. By charting these cinematic cataclysms, I'm not just indulging my penchant for popcorn-fueled pandemonium – I'm unearthing a timeline of cultural tremors.

  This project is my Rosetta Stone for decoding the zeitgeist, a seismograph of silver screen destruction that reveals the fault lines in our shared psyche. It's also my personal guide to cinematic Armageddon, ensuring I never miss a satisfying dose of meticulously orchestrated chaos.

  So join me as we dive into this data-driven disaster zone. Together, we'll unravel the threads of our apocalyptic obsessions, one mushroom cloud at a time. After all, in the world of disaster movies, the end is just the beginning of understanding.`;

  return (
    <div className={`about-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`about-content ${isOpen ? 'open' : ''}`}>
        <h2>About the Project</h2>
        <p>{aboutText}</p>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default AboutProject;