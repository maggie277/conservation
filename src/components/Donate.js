import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "./Spinner";
import { validateEmail, validatePhone, validateAmount } from "./validationUtils";
import './Donate.css';

// Environment detection
const isLocalhost = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Payment API functions (unchanged)
const handlePaymentRequest = async (paymentData) => {
  try {
    const response = await axios.post("http://localhost:4000/process-payment", paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const checkPaymentStatus = async (referenceNo) => {
  try {
    const response = await axios.post("http://localhost:4000/check-payment-status", {
      reference_no: referenceNo,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const Donate = () => {
  // All existing state
  const [formData, setFormData] = useState({
    amount: "",
    email: "",
    phone: "",
    paymentMethod: "mobile"
  });
  const [errors, setErrors] = useState({
    amount: "",
    email: "",
    phone: ""
  });
  const [message, setMessage] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  // Existing validation effects
  useEffect(() => {
    if (formData.phone && !validatePhone(formData.phone)) {
      setErrors(prev => ({...prev, phone: "Please enter a valid Zambian phone number (e.g., 0961234567)"}));
    } else {
      setErrors(prev => ({...prev, phone: ""}));
    }
  }, [formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));

    if (name === "email" && value && !validateEmail(value)) {
      setErrors(prev => ({...prev, email: "Please enter a valid email address"}));
    } else if (name === "email") {
      setErrors(prev => ({...prev, email: ""}));
    }

    if (name === "amount" && value && !validateAmount(value)) {
      setErrors(prev => ({...prev, amount: "Amount must be at least ZMW 1"}));
    } else if (name === "amount") {
      setErrors(prev => ({...prev, amount: ""}));
    }
  };

  const handlePayment = async () => {
    if (!isLocalhost()) {
      setMessage({
        type: "info",
        text: "Online donations coming soon! For now, please contact us at donations@terrafund-zambia.com"
      });
      return;
    }

    let isValid = true;
    const newErrors = {...errors};

    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = "Amount must be at least ZMW 1";
      isValid = false;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone || !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Zambian phone number";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setMessage(null);
    setReceipt(null);
    setIsLoading(true);

    try {
      const paymentData = {
        amount: formData.amount,
        email: formData.email,
        phone: formData.phone,
        payment_method: formData.paymentMethod,
        first_name: "John",
        last_name: "Doe",
        address: "123 Main St",
        city: "Lusaka",
        state: "Lusaka",
        zip_code: "10101",
        country: "ZMB"
      };

      const response = await handlePaymentRequest(paymentData);

      if (response.response?.response_code === "120" || response.response_code === "120") {
        setMessage({ type: "info", text: "Payment initiated. Waiting for confirmation..." });
        const referenceNo = response.response?.reference_no || response.reference_no;
        pollPaymentStatus(referenceNo);
      } 
      else if (response.redirect_url || response.response?.redirect_url) {
        const url = response.redirect_url || response.response.redirect_url;
        setRedirectUrl(url);
        setShowPaymentModal(true);
        setMessage({ 
          type: "info", 
          text: "Please complete payment in the new window. This page will update when payment is confirmed." 
        });
        const referenceNo = response.reference_no || response.response?.reference_no;
        pollPaymentStatus(referenceNo);
      }
      else {
        setIsLoading(false);
        setMessage({ 
          type: "error", 
          text: response.message || response.response?.response_description || "Payment initiation failed" 
        });
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setIsLoading(false);
      let errorMessage = "Payment Error. Please check your details.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.response?.response_description) {
        errorMessage = error.response.data.response.response_description;
      }
      setMessage({ type: "error", text: errorMessage });
    }
  };

  const pollPaymentStatus = async (referenceNo) => {
    let attempts = 0;
    const maxAttempts = 18;
    const interval = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsLoading(false);
        setMessage({ type: "error", text: "Payment timed out. Please check your payment method for confirmation." });
        return;
      }

      attempts++;
      try {
        const statusResponse = await checkPaymentStatus(referenceNo);

        if (statusResponse.status === "success") {
          clearInterval(interval);
          setIsLoading(false);
          setShowPaymentModal(false);
          setMessage({ type: "success", text: "Payment Successful!" });

          const receiptDetails = 
            `RECEIPT
            ---------------------
            Reference No: ${referenceNo}
            Amount: ZMW ${formData.amount}
            Email: ${formData.email}
            Phone: ${formData.phone}
            Payment Method: ${formData.paymentMethod}
            Status: Success ✅
            Date: ${new Date().toLocaleString()}
            `;

          setReceipt(receiptDetails);
        } else if (statusResponse.status === "pending") {
          setMessage({ type: "info", text: "Payment is still processing. Please wait..." });
        } else if (statusResponse.status === "failed") {
          clearInterval(interval);
          setIsLoading(false);
          setShowPaymentModal(false);
          setMessage({ type: "error", text: "Payment Failed. Please try again." });
        }
      } catch (error) {
        console.error("Status Check Error:", error);
        clearInterval(interval);
        setIsLoading(false);
        setShowPaymentModal(false);
        setMessage({ type: "error", text: "Error checking payment status. Please try again." });
      }
    }, 10000);
  };

  const downloadReceipt = () => {
    const element = document.createElement("a");
    const file = new Blob([receipt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Payment_Receipt_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const handleModalContinue = () => {
    window.open(redirectUrl, "_blank");
    setShowPaymentModal(false);
  };

  // Production view
  if (!isLocalhost()) {
    return (
      <div className="donate-page">
        <div className="donate-container">
          <h2>Support Zambian Farmers</h2>
          <div className="coming-soon-message">
            <h3>Online Donations Coming Soon</h3>
            <p>We're currently finalizing our secure payment system.</p>
            <p>For now, please contact us at:</p>
            <p className="contact-email">donations@terrafund-zambia.com</p>
          </div>
        </div>
      </div>
    );
  }

  // Development view (unchanged)
  return (
    <div className="donate-page">
      <div className="donate-container">
        <h2>Donate</h2>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (ZMW)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            placeholder="Amount (ZMW)"
            value={formData.amount}
            onChange={handleInputChange}
            className="donate-input"
            min="1"
          />
          {errors.amount && <div className="error-message">{errors.amount}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="donate-input"
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone (e.g., 0961234567)"
            value={formData.phone}
            onChange={handleInputChange}
            className="donate-input"
            required
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method</label>
          <select 
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="donate-select"
          >
            <option value="mobile">Mobile Money</option>
            <option value="card">Card</option>
          </select>
        </div>
        
        <button 
          onClick={handlePayment} 
          disabled={isLoading || !formData.amount || !formData.email || !formData.phone || errors.amount || errors.email || errors.phone}
          className={`donate-button ${isLoading ? "disabled" : ""}`}
        >
          {isLoading ? <Spinner /> : "Pay Now"}
        </button>

        {message && (
          <div className={`donate-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {receipt && (
          <div className="donate-receipt">
            <h3 style={{ color: "green" }}>Payment Successful ✅</h3>
            <pre>{receipt}</pre>
            <button 
              onClick={downloadReceipt}
              className="download-button"
            >
              Download Receipt
            </button>
          </div>
        )}

        {showPaymentModal && (
          <div className="payment-modal">
            <div className="modal-content">
              <h3>Complete Payment</h3>
              <p>You will be redirected to the payment page in a new window.</p>
              <p>Please complete your payment there. This page will automatically update when your payment is confirmed.</p>
              <div className="modal-buttons">
                <button onClick={() => setShowPaymentModal(false)} className="modal-button cancel">
                  Cancel
                </button>
                <button onClick={handleModalContinue} className="modal-button continue">
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donate;