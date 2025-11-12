# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Start a local server:**
   
   **Option 1: Python**
   ```bash
   python -m http.server 8080
   ```
   
   **Option 2: Node.js**
   ```bash
   npx http-server -p 8080
   ```
   
   **Option 3: VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

## 📝 Usage

1. Enter a URL or text
2. Customize colors and style
3. Upload a logo (optional)
4. Click "Generate QR Code"
5. Download in your preferred format
6. View analytics to track scans

## 🔧 Configuration

Update `frontend/js/config.js` to point to your backend:

```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000', // Change for production
    // ... other settings
};
```

## 🌐 Deployment

### Frontend (GitHub Pages)

1. Push to GitHub
2. Go to Settings → Pages
3. Select source: `main` branch, `/frontend` folder
4. Update `API_URL` in `config.js` to your backend URL

### Backend (Vercel)

```bash
cd backend
vercel
```

Set environment variables in Vercel dashboard.

### Backend (Railway)

```bash
railway login
railway init
railway up
```

### Backend (Render)

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

## 🐛 Troubleshooting

**CORS errors?**
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific error messages

**Database errors?**
- Ensure write permissions in backend directory
- Check `DATABASE_PATH` in `.env`

**QR not generating?**
- Check backend is running
- Verify `API_URL` in frontend `config.js`
- Check browser console for errors

## 📚 API Endpoints

- `POST /api/create` - Create tracking URL
- `GET /api/stats/:id` - Get analytics
- `GET /r/:id` - Redirect and track scan
- `GET /health` - Health check

## 🎨 Customization

### Change Colors

Edit Tailwind config in `frontend/index.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#your-color',
                secondary: '#your-color',
            }
        }
    }
}
```

### Add Features

- Edit `frontend/js/app.js` for UI logic
- Edit `backend/routes/qr.js` for API endpoints
- Edit `backend/models/database.js` for database operations

## 📞 Support

For issues and questions:
- Check the main README.md
- Review the code comments
- Check browser/server console logs

---

Happy QR coding! 🎉
