import { useState } from "react";
import axios from "axios";
import './Donate.css';

const Donate = () => {
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("mobile");
    const [message, setMessage] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setMessage(null);
        setReceipt(null);
        setIsLoading(true);

        try {
            // Step 1: Initiate Payment
            const response = await axios.post("http://localhost:4000/process-payment", {
                amount,
                email,
                phone,
                payment_method: paymentMethod,
                first_name: "John",
                last_name: "Doe",
                address: "123 Main St",
                city: "Lusaka",
                state: "Lusaka",
                zip_code: "10101",
                country: "ZMB"
            });

            console.log("✅ Payment Initiation Response:", response.data);

            // Handle both mobile and card responses
            if (response.data.response?.response_code === "120" || response.data.response_code === "120") {
                // Mobile payment flow (unchanged)
                setMessage({ type: "info", text: "Payment initiated. Waiting for confirmation..." });
                const referenceNo = response.data.response?.reference_no || response.data.reference_no;
                pollPaymentStatus(referenceNo);
            } 
            else if (response.data.redirect_url || response.data.response?.redirect_url) {
                // Card payment flow
                const redirectUrl = response.data.redirect_url || response.data.response.redirect_url;
                window.open(redirectUrl, "_blank");
                setMessage({ 
                    type: "info", 
                    text: "Please complete payment in the new tab. This page will update when payment is confirmed." 
                });
                const referenceNo = response.data.reference_no || response.data.response?.reference_no;
                pollPaymentStatus(referenceNo);
            }
            else {
                setIsLoading(false);
                setMessage({ 
                    type: "error", 
                    text: response.data.message || response.data.response?.response_description || "Payment initiation failed" 
                });
            }
        } catch (error) {
            console.error("🚨 Payment Error:", error);
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
            attempts++;
            console.log(`🔍 Checking payment status (Attempt ${attempts})...`);

            try {
                const statusResponse = await axios.post("http://localhost:4000/check-payment-status", {
                    reference_no: referenceNo,
                });

                console.log("📢 Payment Status Response:", statusResponse.data);

                if (statusResponse.data.status === "success") {
                    clearInterval(interval);
                    setIsLoading(false);
                    setMessage({ type: "success", text: "Payment Successful!" });

                    const receiptDetails = 
                        `RECEIPT
                        ---------------------
                        Reference No: ${referenceNo}
                        Amount: ZMW ${amount}
                        Email: ${email}
                        Phone: ${phone}
                        Payment Method: ${paymentMethod}
                        Status: Success ✅
                        Date: ${new Date().toLocaleString()}
                        `;

                    setReceipt(receiptDetails);
                } else if (statusResponse.data.status === "pending") {
                    setMessage({ type: "info", text: "Payment is still processing. Please wait..." });
                } else if (statusResponse.data.status === "failed") {
                    clearInterval(interval);
                    setIsLoading(false);
                    setMessage({ type: "error", text: "Payment Failed. Please try again." });
                }
            } catch (error) {
                console.error("🚨 Status Check Error:", error);
                clearInterval(interval);
                setIsLoading(false);
                setMessage({ type: "error", text: "Error checking payment status. Please try again." });
            }

            if (attempts >= maxAttempts) {
                clearInterval(interval);
                setIsLoading(false);
                setMessage({ type: "error", text: "Payment timed out. Please check your payment method for confirmation." });
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

    return (
        <div className="donate-container">
            <h2>Donate</h2>
            <input
                className="donate-input"
                type="number"
                placeholder="Amount (ZMW)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
            />
            <input
                className="donate-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                className="donate-input"
                type="tel"
                placeholder="Phone (e.g., 0961234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
            />
            <select 
                className="donate-select"
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
            >
                <option value="mobile">Mobile Money</option>
                <option value="card">Card</option>
            </select>
            <button 
                className={`donate-button ${isLoading ? 'disabled' : ''}`}
                onClick={handlePayment} 
                disabled={isLoading || !amount || !email || !phone}
            >
                {isLoading ? (
                    <span className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                ) : "Pay Now"}
            </button>

            {message && (
                <div className={`donate-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {receipt && (
                <div className="donate-receipt">
                    <h3>Payment Successful ✅</h3>
                    <pre>{receipt}</pre>
                    <button 
                        className="download-button"
                        onClick={downloadReceipt}
                    >
                        Download Receipt
                    </button>
                </div>
            )}
        </div>
    );
};

export default Donate;