const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting to prevent spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many form submissions from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to form submission endpoint
app.use('/api/contact', limiter);

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Input validation and sanitization
const validateAndSanitizeInput = (data) => {
    const errors = [];
    const sanitized = {};

    // Validate and sanitize name
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Name is required');
    } else {
        const name = data.name.trim();
        if (name.length < 2 || name.length > 50) {
            errors.push('Name must be between 2 and 50 characters');
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            errors.push('Name can only contain letters and spaces');
        } else {
            sanitized.name = xss(name);
        }
    }

    // Validate and sanitize mobile
    if (!data.mobile || typeof data.mobile !== 'string') {
        errors.push('Mobile number is required');
    } else {
        const mobile = data.mobile.replace(/\D/g, ''); // Remove non-digits
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            errors.push('Please enter a valid 10-digit mobile number starting with 6-9');
        } else {
            sanitized.mobile = mobile;
        }
    }

    // Validate and sanitize subject
    if (!data.subject || typeof data.subject !== 'string') {
        errors.push('Subject is required');
    } else {
        const subject = data.subject.trim();
        if (subject.length < 5 || subject.length > 100) {
            errors.push('Subject must be between 5 and 100 characters');
        } else {
            sanitized.subject = xss(subject);
        }
    }

    // Validate and sanitize message
    if (!data.message || typeof data.message !== 'string') {
        errors.push('Message is required');
    } else {
        const message = data.message.trim();
        if (message.length < 10 || message.length > 500) {
            errors.push('Message must be between 10 and 500 characters');
        } else {
            sanitized.message = xss(message);
        }
    }

    return { errors, sanitized };
};

// Email template
const createEmailTemplate = (formData) => {
    const currentDate = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        subject: `New Contact Form Submission - ${formData.subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #6366f1; }
                    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #6366f1; }
                    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🎓 New Contact Form Submission</h2>
                        <p>Portfolio Website - Komal Sharma</p>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">👤 Name:</div>
                            <div class="value">${formData.name}</div>
                        </div>
                        <div class="field">
                            <div class="label">📱 Mobile:</div>
                            <div class="value">+91 ${formData.mobile}</div>
                        </div>
                        <div class="field">
                            <div class="label">📍 Location:</div>
                            <div class="value">Lucknow, Uttar Pradesh</div>
                        </div>
                        <div class="field">
                            <div class="label">📝 Subject:</div>
                            <div class="value">${formData.subject}</div>
                        </div>
                        <div class="field">
                            <div class="label">💬 Message:</div>
                            <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
                        </div>
                        <div class="field">
                            <div class="label">⏰ Submitted on:</div>
                            <div class="value">${currentDate} (IST)</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This message was sent via Komal's Portfolio Website contact form.</p>
                        <p>IP Address: ${formData.ip || 'Not available'}</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
New Contact Form Submission

Name: ${formData.name}
Mobile: +91 ${formData.mobile}
Location: Lucknow, Uttar Pradesh
Subject: ${formData.subject}

Message:
${formData.message}

Submitted on: ${currentDate} (IST)

This message was sent via Komal's Portfolio Website contact form.
        `
    };
};

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        // Get client IP for logging
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        
        // Validate and sanitize input
        const { errors, sanitized } = validateAndSanitizeInput(req.body);
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Add IP to sanitized data
        sanitized.ip = clientIP;

        // Create email transporter
        const transporter = createTransporter();
        
        // Verify transporter configuration
        await transporter.verify();

        // Create email content
        const emailContent = createEmailTemplate(sanitized);

        // Email options
        const mailOptions = {
            from: {
                name: 'Komal Sharma Portfolio',
                address: process.env.EMAIL_USER
            },
            to: process.env.RECIPIENT_EMAIL, // Hidden recipient email
            replyTo: `contact+${sanitized.mobile}@komalsharma.in`, // Optional: create reply-to
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            to: process.env.RECIPIENT_EMAIL,
            from: sanitized.mobile,
            subject: sanitized.subject
        });

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Thank you for your message! I\'ll get back to you soon.',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);
        
        // Send error response (don't expose internal details)
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again later or contact me directly at +91 7715855577.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`📬 Recipient: ${process.env.RECIPIENT_EMAIL ? 'Configured' : 'Not configured'}`);
});

module.exports = app;

