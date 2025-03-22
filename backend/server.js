const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

const ZYNLE_SANDBOX_URL = "https://sandbox.zynlepay.com/zynlepay/jsonapi"; // Sandbox URL
const MERCHANT_ID = "MEC00443";
const API_ID = "1cc203c6-21b6-4a56-9c8c-d23169937efd";
const API_KEY = "ec9730c1-bf19-4e55-b76f-0e8b6833acc8";

/**
 * Determines the mobile network based on the phone number.
 * Airtel: 097, 0777 | MTN: 096, 0776
 */
const getNetworkProvider = (phone) => {
    if (/^097|0777/.test(phone)) return "airtel_money";
    if (/^096|0776/.test(phone)) return "mtn_money";
    return null;
};

/**
 * Handles Mobile Money Payments
 */
app.post("/process-payment", async (req, res) => {
    try {
        const { amount, email, phone, payment_method } = req.body;
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

            const response = await axios.post(`${ZYNLE_SANDBOX_URL}`, paymentData, {
                headers: { "Content-Type": "application/json", Accept: "*/*" }
            });

            console.log("✅ Zynle Response:", response.data);
            return res.json(response.data);
        } 

        else if (payment_method === "card") {
            // For card payments, return a response similar to mobile money
            const referenceNo = `REF-${Date.now()}`;
            const cardPaymentUrl = `https://sandbox.zynlepay.com/card-payment?amount=${amount}&email=${email}&phone=${phone}`;

            // Simulate a successful initiation response
            const response = {
                response: {
                    response_code: "120", // Simulate the same response code as mobile money
                    response_description: "Transaction is initiated",
                    reference_no: referenceNo,
                    url: cardPaymentUrl // Include the card payment URL
                }
            };

            console.log("✅ Card Payment Initiation Response:", response);
            return res.json(response);
        } 

        else {
            return res.status(400).json({ message: "Invalid payment method" });
        }

    } catch (error) {
        console.error("🚨 Payment error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * Checks Payment Status
 */
app.post("/check-payment-status", async (req, res) => {
    try {
        const { reference_no } = req.body;
        if (!reference_no) {
            console.error("🚨 Missing reference_no in request body");
            return res.status(400).json({ message: "Reference number required" });
        }

        // Prepare the request body for Zynle API
        const statusData = {
            api_key: API_KEY, // Use the API key directly
            api_id: API_ID,   // Use the API ID directly
            reference_no,     // Reference number from the request
        };

        console.log("🔍 Checking Payment Status:", statusData);

        // Use the correct Zynle API endpoint for payment status
        const response = await axios.post(
            `${ZYNLE_SANDBOX_URL}/paymentstatus`, // Updated endpoint
            statusData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
            }
        );

        console.log("📢 Payment Status Response:", response.data);

        // Handle Zynle API response codes
        if (response.data.response_code === "100") {
            return res.json({ status: "success", data: response.data });
        } else if (response.data.response_code === "990") {
            return res.json({ status: "pending", data: response.data }); // Indicate that the payment is still pending
        } else if (response.data.response_code === "995") {
            return res.json({ status: "failed", data: response.data });
        } else {
            return res.status(400).json({ message: "Payment status check failed", data: response.data });
        }
    } catch (error) {
        console.error("🚨 Status Check Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * Handles Zynle Card Payment Callback
 */
app.post("/card-payment-callback", async (req, res) => {
    try {
        const { response_code, reference_no, amount, response_description } = req.body;

        console.log("🔹 Card Payment Callback Received:", req.body);

        if (response_code === "100") {
            // Payment successful
            console.log("✅ Card Payment Successful:", reference_no);
            return res.json({ status: "success", reference_no, amount });
        } else if (response_code === "995") {
            // Payment failed
            console.log("🚨 Card Payment Failed:", reference_no);
            return res.json({ status: "failed", reference_no, message: response_description });
        } else {
            // Payment pending or other status
            console.log("🔍 Card Payment Pending:", reference_no);
            return res.json({ status: "pending", reference_no, message: response_description });
        }
    } catch (error) {
        console.error("🚨 Card Payment Callback Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});