# 🚀 Setup Instructions for Email Contact Form

## Prerequisites Checklist ✅

### **1. Software Requirements**
- [x] **Node.js** (v16+) - ✅ You have v22.19.0
- [x] **npm** (v6+) - ✅ You have v10.9.3
- [ ] **Email Service Account** (Gmail recommended)

### **2. Email Service Setup (Required for Email Button)**

#### **Gmail Setup:**
1. **Enable 2-Factor Authentication:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" and generate password
   - **Save this password** - you'll need it for `EMAIL_PASS`

3. **Alternative Email Services:**
   - **Outlook/Hotmail:** Use your regular password
   - **Custom SMTP:** Configure in `server.js`

### **3. Installation Steps**

#### **Step 1: Install Dependencies**
```bash
npm install
```

#### **Step 2: Configure Environment**
```bash
# Copy the example file
copy env.example .env

# Edit .env file with your details:
```

**Required .env Configuration:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# Email Configuration (REQUIRED for Email Button)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
RECIPIENT_EMAIL=komalsharma17.in@gmail.com
```

#### **Step 3: Test the Setup**
```bash
# Test email configuration
npm test

# Start the server
npm start
```

## 🎯 How the Dual Button System Works

### **📧 Email Button (Requires Server Setup)**
- **Validates** form data
- **Sends** data to Node.js server
- **Server** sends formatted email to Komal
- **Shows** success/error messages
- **Resets** form on success

### **💬 WhatsApp Button (Works Immediately)**
- **Validates** form data
- **Opens** WhatsApp with pre-filled message
- **No server** required
- **Works** on mobile and desktop

## 🔧 Current Status

### **✅ What Works Now:**
- **WhatsApp Button:** Fully functional
- **Form Validation:** Complete
- **UI/UX:** Modern design with dual buttons
- **Mobile Responsive:** Works on all devices

### **⚠️ What Needs Setup:**
- **Email Button:** Requires server setup
- **Server Dependencies:** Need to install packages
- **Email Configuration:** Need Gmail App Password

## 🚀 Quick Start (WhatsApp Only)

If you want to use **only WhatsApp** for now:

1. **Open your portfolio:** `http://localhost:8000`
2. **Fill the form** and click **"Send WhatsApp"**
3. **WhatsApp opens** with formatted message
4. **Send the message** to Komal

## 📧 Full Setup (Email + WhatsApp)

To enable **both buttons**:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure email:**
   - Set up Gmail App Password
   - Update `.env` file

3. **Start server:**
   ```bash
   npm start
   ```

4. **Test both buttons:**
   - Email button sends to server
   - WhatsApp button opens WhatsApp

## 🆘 Troubleshooting

### **Email Button Not Working:**
- Check if server is running (`npm start`)
- Verify `.env` configuration
- Check Gmail App Password
- Look at server console for errors

### **WhatsApp Button Not Working:**
- Check browser popup blockers
- Try on mobile device
- Verify WhatsApp is installed

### **Form Validation Errors:**
- Check field requirements
- Mobile: 10 digits starting with 6-9
- Name: 2-50 characters, letters only
- Subject: 5-100 characters
- Message: 10-500 characters

## 📞 Support

- **Email:** komalsharma17.in@gmail.com
- **Mobile:** +91 7715855577
- **WhatsApp:** Use the WhatsApp button in the form!



