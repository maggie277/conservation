const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");  // Added for production build serving

const app = express();
const PORT = process.env.PORT || 4000;  // Updated for Render compatibility

app.use(express.json());
app.use(cors());

const ZYNLE_SANDBOX_URL = "https://sandbox.zynlepay.com/zynlepay/jsonapi";
const MERCHANT_ID = process.env.MERCHANT_ID || "MEC00443";  // Updated for environment variables
const API_ID = process.env.API_ID || "1cc203c6-21b6-4a56-9c8c-d23169937efd";
const API_KEY = process.env.API_KEY || "ec9730c1-bf19-4e55-b76f-0e8b6833acc8";

// Mobile network detection
const getNetworkProvider = (phone) => {
    if (/^097|0777/.test(phone)) return "airtel_money";
    if (/^096|0776/.test(phone)) return "mtn_money";
    return null;
};

// Process Payment Endpoint
app.post("/process-payment", async (req, res) => {
    try {
        const { amount, email, phone, payment_method, first_name, last_name, address, city, state, zip_code, country } = req.body;
        
        if (!amount || !email || !phone || !payment_method) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (payment_method === "mobile") {
            const network = getNetworkProvider(phone);
            if (!network) {
                return res.status(400).json({ message: "Invalid phone number for mobile money" });
            }

            const referenceNo = `REF-${Date.now()}`;
            const paymentData = {
                auth: {
                    merchant_id: MERCHANT_ID,
                    api_id: API_ID,
                    api_key: API_KEY,
                    channel: "momo"
                },
                data: {
                    method: "runBillPayment",
                    sender_id: phone,
                    reference_no: referenceNo,
                    amount: amount.toString()
                }
            };

            console.log("🔹 Sending Mobile Money Payment Request:", paymentData);
            const response = await axios.post(ZYNLE_SANDBOX_URL, paymentData, {
                headers: { "Content-Type": "application/json", Accept: "application/json" }
            });
            console.log("✅ Zynle Mobile Money Response:", response.data);
            return res.json(response.data);
        } 
        else if (payment_method === "card") {
            const referenceNo = `REF-${Date.now()}`;
            const cardPaymentData = {
                auth: {
                    merchant_id: MERCHANT_ID,
                    api_id: API_ID,
                    api_key: API_KEY,
                    channel: "card"
                },
                data: {
                    method: "runTranAuthCapture",
                    reference_no: referenceNo,
                    amount: amount.toString(),
                    description: "Card Payment",
                    first_name: first_name,
                    last_name: last_name,
                    address: address,
                    email: email,
                    phone: phone,
                    city: city,
                    state: state,
                    currency: "ZMW",
                    zip_code: zip_code,
                    country: country
                }
            };

            console.log("🔹 Sending Card Payment Request:", cardPaymentData);
            const response = await axios.post(ZYNLE_SANDBOX_URL, cardPaymentData, {
                headers: { "Content-Type": "application/json", Accept: "application/json" }
            });

            return res.json({
                status: "success",
                redirect_url: response.data.response.redirect_url,
                reference_no: referenceNo,
                transaction_id: response.data.response.transaction_id,
                response_code: response.data.response.response_code,
                response_description: response.data.response.response_description
            });
        } 
        else {
            return res.status(400).json({ message: "Invalid payment method" });
        }
    } catch (error) {
        console.error("🚨 Payment error:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: "Payment processing failed",
            error: error.response ? error.response.data : error.message 
        });
    }
});

// Check Payment Status Endpoint
app.post("/check-payment-status", async (req, res) => {
    try {
        const { reference_no } = req.body;
        if (!reference_no) {
            console.error("🚨 Missing reference_no in request body");
            return res.status(400).json({ message: "Reference number required" });
        }

        const statusData = {
            reference_no: reference_no,
            api_id: API_ID,
            api_key: API_KEY
        };

        console.log("🔍 Checking Payment Status:", statusData);
        const response = await axios.post(`${ZYNLE_SANDBOX_URL}/paymentstatus`, statusData, {
            headers: { "Content-Type": "application/json", Accept: "application/json" }
        });

        console.log("📢 Payment Status Response:", response.data);
        if (response.data.response_code === "100") {
            return res.json({ status: "success", data: response.data });
        } else if (response.data.response_code === "990") {
            return res.json({ status: "pending", data: response.data });
        } else if (response.data.response_code === "995") {
            return res.json({ status: "failed", data: response.data });
        } else {
            return res.status(400).json({ message: "Payment status check failed", data: response.data });
        }
    } catch (error) {
        console.error("🚨 Status Check Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Callback Endpoint
app.post("/zynlepay-callback", async (req, res) => {
    try {
        const { response_code, reference_no, amount, response_description } = req.body;
        console.log("🔹 Card Payment Callback Received:", req.body);

        if (response_code === "100") {
            console.log("✅ Card Payment Successful:", reference_no);
            return res.json({ status: "success", reference_no, amount });
        } else if (response_code === "995") {
            console.log("🚨 Card Payment Failed:", reference_no);
            return res.json({ status: "failed", reference_no, message: response_description });
        } else {
            console.log("🔍 Card Payment Pending:", reference_no);
            return res.json({ status: "pending", reference_no, message: response_description });
        }
    } catch (error) {
        console.error("🚨 Card Payment Callback Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, '../build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🛠️  Mode: ${process.env.NODE_ENV || 'development'}`);
});