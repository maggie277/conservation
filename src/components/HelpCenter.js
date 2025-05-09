import React, { useState } from "react";
import helpcenterImage from '../pictures/projects.jpg';
import { Button, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TidioChat from './TidioChat';
import './HelpCenter.css';

const faqs = [
  { 
    question: "How do I create a farming project?", 
    answer: "To create a project, go to 'Submit Project' from your profile, fill in details about your sustainable agriculture initiative, and submit for review." 
  },
  { 
    question: "What makes a successful farming campaign?", 
    answer: "Successful campaigns have clear goals, demonstrate sustainability impact, include high-quality images of your farm, and show community involvement." 
  },
  { 
    question: "How do I receive funds for my project?", 
    answer: "Once funded, funds are transferred to your registered mobile money account (Airtel Money or MTN Mobile Money) within 3-5 business days." 
  },
  { 
    question: "Are there any platform fees?", 
    answer: "We charge a 5% platform fee on successfully funded projects to maintain our services. Payment processing fees may apply." 
  },
  { 
    question: "How can I promote my farming project?", 
    answer: "Share on WhatsApp groups, community meetings, and local radio stations. We also provide promotional materials for cooperatives." 
  },
];

const HelpCenter = () => {
  const [expanded, setExpanded] = useState(null);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <div className="help-center-container">
      <TidioChat />
      <Box className="help-center-header">
        <Typography variant="h3" className="help-center-title">
          Farming Support Center
        </Typography>
        <Typography variant="subtitle1" className="help-center-subtitle">
          Get help with your sustainable agriculture projects
        </Typography>
      </Box>

      <Paper className="faq-container">
        <Typography variant="h5" className="faq-title">
          Frequently Asked Questions
        </Typography>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <Accordion 
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              className="faq-item"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className="faq-question"
              >
                <Typography>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails className="faq-answer">
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </Paper>

      <Box className="contact-box">
        <Typography variant="h6">Need more help?</Typography>
        <Button 
          variant="contained" 
          className="contact-button"
          onClick={() => window.location.href = 'mailto:support@terrafund.zm'}
        >
          Contact Our Farming Support Team
        </Button>
      </Box>
    </div>
  );
};

export default HelpCenter;