import React, { useState } from "react";
import helpcenterImage from '../pictures/helpcenter.jpg'; // Import the background image

const faqs = [
  { question: "How do I create a project?", answer: "To create a project, go to the 'Upload Project' page, fill in the details, and submit your campaign." },
  { question: "What are the requirements for a successful campaign?", answer: "A successful campaign has a clear goal, compelling story, high-quality images, and active promotion on social media." },
  { question: "How do I withdraw funds?", answer: "Once your campaign ends successfully, go to your profile, click 'Withdraw Funds', and follow the instructions." },
  { question: "Are there any platform fees?", answer: "Yes, we charge a small platform fee of 5% plus payment processing fees on all successful transactions." },
  { question: "How can I promote my campaign?", answer: "You can share your campaign on social media, collaborate with influencers, and reach out to your community." },
];

const HelpCenter = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    console.log("Clicked FAQ index:", index); // Debugging
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div
      style={{
        backgroundImage: `url(${helpcenterImage})`, // Apply background image
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh", // Ensure it covers the full viewport height
        width: "100vw", // Ensure it covers the full viewport width
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#5D4037", // Semi-transparent white background
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "800px",
          width: "100%",
          boxShadow: "#4B2F07 0px 0px 20px",
          marginTop: "160px", // Moves section lower
        }}
      >
        <h1
          style={{
            color: "#5D4037",
            textAlign: "center",
            fontSize: "24px",
            marginBottom: "20px",
          }}
        >
          Help Center
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#5D4037",
                border: "1px solid #ddd",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  width: "100%",
                  padding: "15px",
                  textAlign: "left",
                  border: "none",
                  backgroundColor: "#f0f0f0",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#5D4037",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.3s",
                }}
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span>{activeIndex === index ? "▲" : "▼"}</span>
              </button>
              {activeIndex === index && (
                <p
                  style={{
                    marginTop: "8px",
                    padding: "15px",
                    backgroundColor: "#f9f9f9",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;