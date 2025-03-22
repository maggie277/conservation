import { useState } from "react";
import axios from "axios";

const Donate = () => {
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("mobile");
    const [message, setMessage] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const handlePayment = async () => {
        setMessage(null); // Reset messages
        setReceipt(null);
        setIsLoading(true); // Start loading

        try {
            // Step 1: Initiate Payment
            const response = await axios.post("http://localhost:4000/process-payment", {
                amount,
                email,
                phone,
                payment_method: paymentMethod,
            });

            console.log("✅ Payment Initiation Response:", response.data);

            if (response.data.status === "redirect") {
                // Redirect the user to the payment page
                window.location.href = response.data.redirect_url;
            } else if (response.data.response?.response_code === "120") {
                setMessage({ type: "info", text: "Payment initiated. Waiting for confirmation..." });

                const referenceNo = response.data.response.reference_no;
                console.log("🔍 Reference No:", referenceNo);

                // Step 2: Poll for Payment Status
                let attempts = 0;
                const maxAttempts = 18; // 18 attempts * 10 seconds = 3 minutes
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

                            // Generate Receipt
                            const receiptDetails = `
                                RECEIPT
                                ---------------------
                                Reference No: ${referenceNo}
                                Amount: ZMW ${amount}
                                Email: ${email}
                                Phone: ${phone}
                                Payment Method: ${paymentMethod}
                                Status: Success ✅
                            `;

                            setReceipt(receiptDetails);
                        } else if (statusResponse.data.status === "pending") {
                            // Payment is still pending, continue polling
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

                    // Stop polling after max attempts (3 minutes)
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        setIsLoading(false);
                        setMessage({ type: "error", text: "Payment timed out. Please check your mobile money for confirmation." });
                    }
                }, 10000); // Check every 10 seconds
            } else {
                setIsLoading(false);
                setMessage({ type: "error", text: "Payment initiation failed. Please try again." });
            }
        } catch (error) {
            console.error("🚨 Payment Error:", error);
            setIsLoading(false);
            setMessage({ type: "error", text: "Payment Error. Please check your details." });
        }
    };

    const downloadReceipt = () => {
        const element = document.createElement("a");
        const file = new Blob([receipt], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "Payment_Receipt.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", textAlign: "center" }}>
            <h2>Donate</h2>
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="mobile">Mobile Money</option>
                <option value="card">Card</option>
            </select>
            <button onClick={handlePayment} disabled={isLoading}>
                {isLoading ? "Processing..." : "Pay Now"}
            </button>

            {message && (
                <div style={{ color: message.type === "success" ? "green" : message.type === "info" ? "blue" : "red", marginTop: "10px" }}>
                    {message.text}
                </div>
            )}

            {receipt && (
                <div>
                    <h3>Payment Successful ✅</h3>
                    <pre>{receipt}</pre>
                    <button onClick={downloadReceipt}>Download Receipt</button>
                </div>
            )}
        </div>
    );
};

export default Donate;