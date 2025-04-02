import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, Typography, Box } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Onboarding = () => {
  const steps = [
    {
      title: "Welcome to Conservation Hub!",
      content: "Let's take a quick tour to help you get started with our platform."
    },
    {
      title: "Navigation",
      content: "Use the Home button to return to the main page anytime.",
      highlightElement: 'home-button'
    },
    {
      title: "Browse Projects",
      content: "Discover conservation efforts in your community here.",
      highlightElement: 'projects-button'
    },
    {
      title: "Upload Projects",
      content: "Share your conservation initiatives by clicking here.",
      highlightElement: 'upload-button'
    },
    {
      title: "Your Profile",
      content: "Manage your account and track your contributions here.",
      highlightElement: 'profile-button'
    },
    {
      title: "Ready to Go!",
      content: "You're all set to make a difference in conservation efforts!"
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
            backgroundColor: 'rgba(139, 69, 19, 0.2)',
            border: '2px solid #8B4513',
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
        sx={{
          '& .MuiDialog-paper': {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            margin: 0,
            maxWidth: '400px',
            backgroundColor: '#F5F5DC',
            color: '#5D4037'
          }
        }}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {steps[currentStep].title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {steps[currentStep].content}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
              disabled={currentStep === 0}
              sx={{ color: '#5D4037', borderColor: '#5D4037' }}
            >
              Back
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleNext}
              sx={{ 
                ml: 2,
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#A0522D' }
              }}
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {steps.map((_, index) => (
              <div 
                key={index}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: index === currentStep ? '#8B4513' : '#D2B48C',
                  margin: '0 5px'
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Onboarding;