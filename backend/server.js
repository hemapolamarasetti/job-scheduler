// server.js
require('dotenv').config();          // Load .env variables (PORT, WEBHOOK_URL)
const express = require('express');  // Web framework
const cors = require('cors');        // Allow frontend calls
const db = require('./db');          // Our SQLite database connection
const axios = require('axios');      // For sending webhook requests

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());                     // Enable CORS
app.use(express.json());             // Parse JSON request bodies

// Utility: current timestamp
const now = () => new Date().toISOString();

/**
 * POST /jobs
 * Create a new job with status "pending"
 */
app.post('/jobs', (req, res) => {
  const { taskName, payload, priority } = req.body;

  // Validate inputs
  if (!taskName || !priority) {
    return res.status(400).json({ error: 'taskName and priority are required' });
  }
  if (!['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'priority must be Low, Medium, or High' });
  }

  const createdAt = now();
  const updatedAt = createdAt;
  const payloadStr = payload ? JSON.stringify(payload) : JSON.stringify({});

  const sql = `
    INSERT INTO jobs (taskName, payload, priority, status, createdAt, updatedAt)
    VALUES (?, ?, ?, 'pending', ?, ?)
  `;
  const params = [taskName, payloadStr, priority, createdAt, updatedAt];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('DB insert error:', err);
      return res.status(500).json({ error: 'Failed to create job' });
    }
    res.status(201).json({
      id: this.lastID,
      taskName,
      payload: JSON.parse(payloadStr),
      priority,
      status: 'pending',
      createdAt,
      updatedAt,
    });
  });
});

/**
 * GET /jobs
 * List jobs with optional filters (status, priority)
 */
app.get('/jobs', (req, res) => {
  const { status, priority } = req.query;

  let sql = 'SELECT * FROM jobs';
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }
  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY createdAt DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('DB select error:', err);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }
    const data = rows.map(r => ({
      ...r,
      payload: r.payload ? JSON.parse(r.payload) : {},
    }));
    res.json(data);
  });
});

/**
 * GET /jobs/:id
 * Fetch job detail
 */
app.get('/jobs/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM jobs WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('DB get error:', err);
      return res.status(500).json({ error: 'Failed to fetch job' });
    }
    if (!row) return res.status(404).json({ error: 'Job not found' });
    row.payload = row.payload ? JSON.parse(row.payload) : {};
    res.json(row);
  });
});

/**
 * POST /run-job/:id
 * Simulate background processing:
 * 1) status -> running
 * 2) wait 3 seconds
 * 3) status -> completed
 * 4) send webhook
 */
app.post('/run-job/:id', (req, res) => {
  const { id } = req.params;

  // Set status to "running"
  const setRunningSql = `
    UPDATE jobs SET status = 'running', updatedAt = ? WHERE id = ?
  `;
  db.run(setRunningSql, [now(), id], function (err) {
    if (err) {
      console.error('DB update running error:', err);
      return res.status(500).json({ error: 'Failed to start job' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Respond immediately so UI doesn't wait 3s
    res.json({ message: 'Job started', id });

    // Simulate processing with a 3-second delay
    setTimeout(() => {
      db.get('SELECT * FROM jobs WHERE id = ?', [id], (getErr, job) => {
        if (getErr || !job) {
          console.error('DB get during run error:', getErr);
          return;
        }

        const completedAt = now();
        const setCompletedSql = `
          UPDATE jobs SET status = 'completed', updatedAt = ?, completedAt = ? WHERE id = ?
        `;
        db.run(setCompletedSql, [completedAt, completedAt, id], function (updErr) {
          if (updErr) {
            console.error('DB update completed error:', updErr);
            return;
          }

          // Prepare webhook payload
          const webhookPayload = {
            jobId: job.id,
            taskName: job.taskName,
            priority: job.priority,
            payload: job.payload ? JSON.parse(job.payload) : {},
            completedAt,
          };

          // Send webhook
          const url = process.env.WEBHOOK_URL;
          if (!url) {
            console.warn('WEBHOOK_URL not set—skipping webhook');
            return;
          }

          axios.post(url, webhookPayload)
            .then(response => {
              console.log('Webhook sent:', {
                status: response.status,
                data: response.data,
              });
            })
            .catch(error => {
              console.error('Webhook error:', error.message);
            });
        });
      });
    }, 3000);
  });
});

/**
 * Optional: POST /webhook-test
 * Local receiver to inspect webhook payloads during development
 */
app.post('/webhook-test', (req, res) => {
  console.log('Received local webhook-test payload:', req.body);
  res.json({ ok: true, received: req.body });
});

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});