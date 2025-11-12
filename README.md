# Custom QR Code Generator Web App

A modern, full-featured QR code generator with analytics tracking, custom styling options, and scan analytics.

![QR Generator](https://img.shields.io/badge/QR-Generator-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### Frontend
- **Custom QR Styling**: Colors, gradients, logo upload, rounded/square dots
- **Real-time Preview**: See changes as you customize
- **Multiple Export Formats**: PNG, SVG, and PDF
- **Analytics Integration**: Track QR code scans
- **Local Storage**: Save your recent QR codes
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on all devices

### Backend
- **URL Shortening**: Generate short tracking URLs
- **Analytics Tracking**: Record scans with IP, user-agent, timestamp
- **RESTful API**: Clean API endpoints for QR management
- **Database Storage**: SQLite for lightweight data persistence
- **Security**: CORS protection, rate limiting, and input validation

## 📁 Project Structure

```
custom-qr-generator/
├── frontend/              # Frontend application
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Custom styles
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   ├── qr-generator.js# QR generation logic
│   │   └── analytics.js   # Analytics integration
│   └── assets/            # Images and icons
├── backend/               # Backend API
│   ├── server.js          # Express server
│   ├── routes/            # API routes
│   │   ├── qr.js          # QR endpoints
│   │   └── redirect.js    # Redirect handler
│   ├── models/            # Database models
│   │   └── database.js    # SQLite setup
│   ├── middleware/        # Express middleware
│   │   ├── cors.js        # CORS configuration
│   │   └── rateLimit.js   # Rate limiting
│   ├── utils/             # Utility functions
│   │   └── shortId.js     # ID generation
│   ├── package.json       # Dependencies
│   └── .env.example       # Environment variables template
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- QR Code Styling library
- jsPDF (for PDF export)

### Backend
- Node.js
- Express.js
- SQLite3
- CORS middleware
- Express Rate Limit

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
DATABASE_PATH=./database.sqlite
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create a `.env.js` file (or configure API URL directly in app.js):
```javascript
const CONFIG = {
  API_URL: 'http://localhost:3000'
};
```

3. Serve the frontend using a local server:
```bash
# Using Python
python -m http.server 8080

# Or using Node.js http-server
npx http-server -p 8080
```

The frontend will be available at `http://localhost:8080`

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/custom-qr-generator.git
git push -u origin main
```

2. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select source: `main` branch, `/frontend` folder (or root if frontend is in root)
   - Save and wait for deployment

3. Update the API URL in `frontend/js/app.js`:
```javascript
const API_URL = 'https://your-backend.vercel.app';
```

### Backend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Deploy to Vercel:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-username.github.io`
   - `DATABASE_PATH=/tmp/database.sqlite`

5. Note: For production, consider using a cloud database (MongoDB, PostgreSQL) instead of SQLite

### Backend Deployment (Railway)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
cd backend
railway init
railway up
```

4. Set environment variables:
```bash
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-username.github.io
```

### Backend Deployment (Render)

1. Create a new Web Service on [Render.com](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**: Add all variables from `.env.example`

## 📖 API Documentation

### Endpoints

#### Create QR Code
```http
POST /api/create
Content-Type: application/json

{
  "url": "https://example.com",
  "styleOptions": {
    "color": "#000000",
    "bgColor": "#ffffff"
  }
}

Response:
{
  "success": true,
  "shortId": "abc123",
  "trackingUrl": "https://qr.oniko.dev/r/abc123",
  "originalUrl": "https://example.com"
}
```

#### Redirect and Track
```http
GET /r/:id

Redirects to original URL and records scan
```

#### Get Analytics
```http
GET /api/stats/:id

Response:
{
  "success": true,
  "id": "abc123",
  "originalUrl": "https://example.com",
  "totalScans": 42,
  "uniqueScans": 28,
  "createdAt": "2025-11-12T10:30:00Z",
  "scans": [
    {
      "timestamp": "2025-11-12T11:00:00Z",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

## 🎨 Usage

1. **Generate QR Code**:
   - Enter a URL or text
   - Customize colors, style, and add a logo
   - Click "Generate QR Code"

2. **Download**:
   - Choose format (PNG, SVG, or PDF)
   - Click download button

3. **View Analytics**:
   - Copy your QR code's tracking ID
   - Click "View Analytics"
   - See scan statistics and trends

4. **Recent QR Codes**:
   - Access your previously generated QR codes from local storage
   - Re-download or view analytics

## 🔐 Security Considerations

- **Rate Limiting**: API requests are rate-limited to prevent abuse
- **CORS**: Configured to only allow requests from your frontend domain
- **Input Validation**: All inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored in environment variables
- **IP Privacy**: Consider hashing IPs for GDPR compliance

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) - QR code generation library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Express.js](https://expressjs.com/) - Backend framework

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter)

Project Link: [https://github.com/YOUR_USERNAME/custom-qr-generator](https://github.com/YOUR_USERNAME/custom-qr-generator)

---

Made with ❤️ by [Your Name]
