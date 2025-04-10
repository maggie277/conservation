import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, Typography, Box } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import './Onboarding.css';

const Onboarding = () => {
  const steps = [
    {
      title: "Welcome to TerraFund Zambia!",
      content: "Let's help you get started with sustainable farming projects."
    },
    {
      title: "Explore Farm Projects",
      content: "Discover sustainable agriculture initiatives in your community.",
      highlightElement: 'projects-button'
    },
    {
      title: "Submit Your Project",
      content: "Share your farming initiative to get community support.",
      highlightElement: 'upload-button'
    },
    {
      title: "My Farm Profile",
      content: "Manage your account and track your farming projects.",
      highlightElement: 'profile-button'
    },
    {
      title: "Ready to Grow!",
      content: "You're all set to contribute to Zambia's sustainable agriculture!"
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState({ display: 'none' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists() && !userDoc.data().has_seen_onboarding) {
          setTimeout(() => setOpen(true), 1500);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (open && steps[currentStep]?.highlightElement) {
      const updateHighlight = () => {
        const element = document.getElementById(steps[currentStep].highlightElement);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightStyle({
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            backgroundColor: 'rgba(46, 139, 87, 0.2)',
            border: '2px solid var(--green)',
            borderRadius: '4px',
            zIndex: 1300,
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
          });
        }
      };

      updateHighlight();
      window.addEventListener('resize', updateHighlight);

      return () => window.removeEventListener('resize', updateHighlight);
    } else {
      setHighlightStyle({ display: 'none' });
    }
  }, [currentStep, open]);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await updateDoc(doc(db, 'users', userId), {
        has_seen_onboarding: true
      });
      setOpen(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <div style={highlightStyle} />
      
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        className="onboarding-dialog"
      >
        <DialogContent className="onboarding-content">
          <Typography variant="h6" className="onboarding-title">
            {steps[currentStep].title}
          </Typography>
          <Typography variant="body1" className="onboarding-text">
            {steps[currentStep].content}
          </Typography>
          
          <Box className="onboarding-actions">
            <Button 
              variant="outlined" 
              onClick={handleBack}
              disabled={currentStep === 0}
              className="onboarding-back-button"
            >
              Back
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleNext}
              className="onboarding-next-button"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
          
          <Box className="onboarding-progress">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Onboarding;