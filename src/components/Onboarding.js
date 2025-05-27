import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Button, Typography, Box, IconButton } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
      highlightElement: 'projects-nav-button',
      mobileHighlightElement: 'mobile-projects-nav-button',
      helpText: "Click the 'Farm Projects' button in the navigation menu"
    },
    {
      title: "Submit Your Project",
      content: "Share your farming initiative to get community support.",
      highlightElement: 'upload-nav-button',
      mobileHighlightElement: 'mobile-upload-nav-button',
      helpText: "Click 'Submit Project' to share your farming initiative"
    },
    {
      title: "Need Help?",
      content: "Our help center is always available if you need assistance.",
      highlightElement: 'help-nav-button',
      mobileHighlightElement: 'mobile-help-nav-button',
      helpText: "Click 'Help Center' anytime you need support or guidance",
      showHelpIcon: true
    },
    {
      title: "My Farm Profile",
      content: "Manage your account and track your farming projects.",
      highlightElement: 'profile-nav-button',
      mobileHighlightElement: 'mobile-profile-nav-button',
      helpText: "Click 'My Farm' to access your profile to manage your projects and settings"
    },
    {
      title: "Ready to Grow!",
      content: "You're all set to contribute to Zambia's sustainable agriculture!"
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && !userDoc.data().has_seen_onboarding) {
          setTimeout(() => setOpen(true), 1000);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) {
      setHighlightStyle({ display: 'none' });
      return;
    }

    const step = steps[currentStep];
    const elementId = isMobileView ? step.mobileHighlightElement : step.highlightElement;

    if (!elementId) {
      setHighlightStyle({ display: 'none' });
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightStyle({
        display: 'block',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        position: 'fixed',
        backgroundColor: 'rgba(46, 139, 87, 0.2)',
        border: '3px solid var(--green)',
        borderRadius: '8px',
        zIndex: 1400,
        pointerEvents: 'none',
        animation: 'pulse 1.5s infinite',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
      });
    } else {
      setHighlightStyle({ display: 'none' });
    }
  }, [currentStep, open, isMobileView]);

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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <>
      <div style={highlightStyle} className="onboarding-highlight-box" />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent className="onboarding-content">
          <Box display="flex" alignItems="center">
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {steps[currentStep].title}
            </Typography>
            {steps[currentStep].showHelpIcon && (
              <IconButton sx={{ color: 'var(--green)', animation: 'bounce 2s infinite' }}>
                <HelpOutlineIcon fontSize="large" />
              </IconButton>
            )}
          </Box>

          <Typography variant="body1" sx={{ marginBottom: '10px' }}>
            {steps[currentStep].content}
          </Typography>

          {steps[currentStep].helpText && (
            <Box sx={{
              backgroundColor: 'rgba(46, 139, 87, 0.1)',
              padding: '12px',
              borderLeft: '4px solid var(--green)',
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <Typography variant="body2">
                👉 <strong>Where to click:</strong> {steps[currentStep].helpText}
              </Typography>
            </Box>
          )}

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button onClick={handleBack} disabled={currentStep === 0} variant="outlined">
              Back
            </Button>
            <Button onClick={handleNext} variant="contained" style={{ backgroundColor: 'var(--green)' }}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>

          <Box mt={3} display="flex" justifyContent="center" gap="8px">
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: i === currentStep ? 'var(--green)' : '#ccc',
                  transition: 'all 0.3s'
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
