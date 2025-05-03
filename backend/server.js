const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const isDev = process.env.NODE_ENV !== 'production';
const PORT = isDev ? 4001 : 10000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect('mongodb://localhost:27017/conservation-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Forum Post Schema
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Zynle API Configuration
const ZYNLE_SANDBOX_URL = "https://sandbox.zynlepay.com/zynlepay/jsonapi";
const MERCHANT_ID = "MEC00443";
const API_ID = "1cc203c6-21b6-4a56-9c8c-d23169937efd";
const API_KEY = "ec9730c1-bf19-4e55-b76f-0e8b6833acc8";

// Helper Functions
const getNetworkProvider = (phone) => {
  if (/^097|0777/.test(phone)) return "airtel_money";
  if (/^096|0776/.test(phone)) return "mtn_money";
  return null;
};

// ===== Forum API Endpoints =====
app.get('/api/forum/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/forum/posts', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    category: req.body.category
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Payment API Endpoints =====
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

      const response = await axios.post(ZYNLE_SANDBOX_URL, paymentData);
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
          first_name: first_name || "Customer",
          last_name: last_name || "Anonymous",
          address: address || "Not Provided",
          email: email,
          phone: phone,
          city: city || "Lusaka",
          state: state || "Lusaka",
          currency: "ZMW",
          zip_code: zip_code || "10101",
          country: country || "ZMB"
        }
      };

      const response = await axios.post(ZYNLE_SANDBOX_URL, cardPaymentData);
      return res.json({
        status: "success",
        redirect_url: response.data.response.redirect_url,
        reference_no: referenceNo
      });
    } 
    else {
      return res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("Payment error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Payment processing failed",
      error: error.response?.data || error.message 
    });
  }
});

app.post("/check-payment-status", async (req, res) => {
  try {
    const { reference_no } = req.body;
    if (!reference_no) {
      return res.status(400).json({ message: "Reference number required" });
    }

    const statusData = {
      reference_no: reference_no,
      api_id: API_ID,
      api_key: API_KEY
    };

    const response = await axios.post(`${ZYNLE_SANDBOX_URL}/paymentstatus`, statusData);
    
    if (response.data.response_code === "100") {
      return res.json({ status: "success", data: response.data });
    } else if (response.data.response_code === "990") {
      return res.json({ status: "pending", data: response.data });
    } else {
      return res.json({ status: "failed", data: response.data });
    }
  } catch (error) {
    console.error("Status check error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Status check failed",
      error: error.response?.data || error.message 
    });
  }
});

// Serve frontend in production
if (!isDev) {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(40)}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${isDev ? 'Development' : 'Production'}`);
  if (isDev) {
    console.log(`🔗 Frontend: http://localhost:3000`);
    console.log(`🔗 Backend API: http://localhost:${PORT}`);
    console.log(`🔗 Forum API: http://localhost:${PORT}/api/forum/posts`);
  }
  console.log(`${'='.repeat(40)}\n`);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server terminated');
    process.exit(0);
  });
});