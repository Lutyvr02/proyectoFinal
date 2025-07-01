const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Store for SSE connections
const clients = new Map();

// SSE endpoint for auction updates
app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const clientId = Date.now();
  clients.set(clientId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to auction server' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(clientId);
  });
});

// Broadcast function
function broadcast(data) {
  clients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
    }
  });
}

// Endpoint to update bids
app.post('/update-bid', (req, res) => {
  const { productId, username, amount } = req.body;
  
  try {
    // Read current database
    const dbPath = path.join(__dirname, '../db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Update product with new bid
    const productIndex = db.products.findIndex(p => p.id === parseInt(productId));
    if (productIndex !== -1) {
      db.products[productIndex].currentBid = amount;
      db.products[productIndex].currentBidder = username;
    }
    
    // Add bid to history
    const newBid = {
      id: Date.now(),
      productId: parseInt(productId),
      username,
      amount,
      timestamp: new Date().toISOString()
    };
    db.bids.push(newBid);
    
    // Write back to database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    // Broadcast the update
    broadcast({
      type: 'bid_update',
      productId: parseInt(productId),
      currentBid: amount,
      currentBidder: username,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating bid:', error);
    res.status(500).json({ error: 'Failed to update bid' });
  }
});

// Endpoint to add chat message
app.post('/add-message', (req, res) => {
  const { productId, username, message } = req.body;
  
  try {
    // Read current database
    const dbPath = path.join(__dirname, '../db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Add message to chat
    const newMessage = {
      id: Date.now(),
      productId: parseInt(productId) || undefined, // If productId is 0, make it undefined for global chat
      username,
      message,
      timestamp: new Date().toISOString()
    };
    
    // Ensure chat array exists
    if (!db.chat) {
      db.chat = [];
    }
    
    db.chat.push(newMessage);
    
    // Write back to database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    // Broadcast the message immediately
    broadcast({
      type: 'chat_message',
      productId: parseInt(productId) || 0, // Send 0 for global chat
      username,
      message,
      timestamp: newMessage.timestamp,
      id: newMessage.id
    });
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Timer updates
setInterval(() => {
  try {
    const dbPath = path.join(__dirname, '../db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    let dbChanged = false;
    
    db.products.forEach(product => {
      const startTime = new Date(product.startTime);
      const endTime = new Date(startTime.getTime() + (product.duration * 1000));
      const now = new Date();
      
      // Check if auction should start
      if (product.status === 'upcoming' && now >= startTime) {
        product.status = 'active';
        dbChanged = true;
        broadcast({
          type: 'auction_started',
          productId: product.id,
          message: `Auction for ${product.title} has started!`
        });
      }
      
      // Handle active auctions
      if (product.status === 'active') {
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        
        if (timeLeft === 0) {
          // Auction ended
          product.status = 'finished';
          dbChanged = true;
          
          broadcast({
            type: 'auction_ended',
            productId: product.id,
            winner: product.currentBidder,
            finalBid: product.currentBid,
            title: product.title
          });
        } else {
          // Send timer update every 5 seconds to avoid spam
          if (timeLeft % 5 === 0 || timeLeft <= 10) {
            broadcast({
              type: 'timer_update',
              productId: product.id,
              timeLeft
            });
          }
        }
      }
    });
    
    // Save changes if any
    if (dbChanged) {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
  } catch (error) {
    console.error('Error in timer update:', error);
  }
}, 1000);

app.listen(PORT, () => {
  console.log(`SSE Server running on port ${PORT}`);
});
