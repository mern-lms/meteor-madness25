# Setup Guide - Asteroid Impact Simulator

This guide will help you set up and run the Asteroid Impact Simulator on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

## Step-by-Step Setup

### 1. Get a NASA API Key (Optional but Recommended)

1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the form to get your free API key
3. You'll receive the key instantly via email
4. Keep this key handy for the next step

**Note:** The app will work with the `DEMO_KEY`, but it has rate limits. A personal API key is recommended for better performance.

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in a text editor and add your NASA API key:
   ```
   NASA_API_KEY=your_actual_api_key_here
   PORT=3000
   FLASK_PORT=5000
   ```

### 3. Install Node.js Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install:
- express (web server)
- axios (HTTP client)
- cors (cross-origin resource sharing)
- dotenv (environment variables)

### 4. Install Python Dependencies

In the same terminal, run:

```bash
pip install -r requirements.txt
```

This will install:
- flask (Python web framework)
- flask-cors (CORS support)
- requests (HTTP library)
- numpy (numerical computing)
- python-dotenv (environment variables)

**Troubleshooting:** If you get permission errors, try:
```bash
pip install --user -r requirements.txt
```

### 5. Start the Servers

You need to run **two servers** simultaneously:

#### Terminal 1 - Node.js Server (Port 3000)

```bash
npm start
```

You should see:
```
🚀 Asteroid Impact Simulator Server running on http://localhost:3000
📡 NASA API Key: Custom key configured
🌍 Open http://localhost:3000 in your browser to start
```

#### Terminal 2 - Python Flask Server (Port 5000)

Open a **new terminal** in the same directory and run:

```bash
python app.py
```

You should see:
```
🧮 Starting Asteroid Impact Calculator (Flask)
📊 Endpoints available:
  - POST /api/calculate/trajectory
  - POST /api/calculate/impact
  - POST /api/calculate/mitigation
  - POST /api/calculate/crater
🚀 Server running on http://localhost:5000
```

### 6. Open in Browser

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the Asteroid Impact Simulator interface!

## Verification Checklist

✅ Node.js server running on port 3000  
✅ Flask server running on port 5000  
✅ Browser shows the main interface  
✅ NASA NEO data loads in "Featured Asteroids" section  
✅ 3D visualization shows Earth and asteroid  
✅ Sliders adjust asteroid parameters  
✅ "Calculate Impact" button works  

## Common Issues and Solutions

### Issue: "Port already in use"

**Solution:** Another application is using port 3000 or 5000.

- Change the port in `.env`:
  ```
  PORT=3001
  FLASK_PORT=5001
  ```
- Update `app.js` line 11 to match your Flask port:
  ```javascript
  const FLASK_API = 'http://localhost:5001';
  ```

### Issue: "Module not found" errors

**Solution:** Dependencies not installed properly.

```bash
# For Node.js
npm install

# For Python
pip install -r requirements.txt
```

### Issue: "Failed to fetch NASA data"

**Solution:** Check your API key and internet connection.

1. Verify your NASA API key in `.env`
2. Check if you can access: https://api.nasa.gov/neo/rest/v1/stats?api_key=DEMO_KEY
3. If using DEMO_KEY, you might be rate-limited. Wait a few minutes or use a personal key.

### Issue: "Failed to calculate impact"

**Solution:** Flask server not running or wrong port.

1. Make sure Flask server is running in a separate terminal
2. Check that it's on port 5000 (or your configured port)
3. Verify the `FLASK_API` constant in `app.js` matches your Flask port

### Issue: Python packages won't install

**Solution:** Try using a virtual environment.

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### Issue: 3D visualization not showing

**Solution:** Browser compatibility or JavaScript errors.

1. Open browser console (F12) and check for errors
2. Try a different browser (Chrome, Firefox, Edge recommended)
3. Clear browser cache and reload

## Development Mode

For development with auto-reload:

### Node.js with nodemon:
```bash
npm run dev
```

### Python Flask with debug mode:
Flask already runs in debug mode by default in `app.py`.

## Testing the Application

### Test NASA API Integration:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/asteroids/featured
```

### Test Impact Calculations:
```bash
curl -X POST http://localhost:5000/api/calculate/impact \
  -H "Content-Type: application/json" \
  -d "{\"diameter\": 100, \"velocity\": 20, \"density\": 3000, \"angle\": 45}"
```

## Performance Tips

1. **Use a personal NASA API key** instead of DEMO_KEY
2. **Close unnecessary browser tabs** for better 3D performance
3. **Use Chrome or Firefox** for best WebGL support
4. **Reduce asteroid size** if 3D rendering is slow

## Next Steps

Once everything is running:

1. Try the preset scenarios (Chelyabinsk, Tunguska, etc.)
2. Adjust parameters and calculate impacts
3. Explore mitigation strategies
4. Check out the real NASA NEO data in the Featured Asteroids section

## Need Help?

- Check the main [README.md](README.md) for feature documentation
- Review the code comments for technical details
- Open an issue on the repository

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2 for Node.js
3. Use gunicorn for Flask:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
4. Set up a reverse proxy (nginx) to serve both servers
5. Enable HTTPS with SSL certificates

---

**Happy asteroid hunting! 🌍🚀**
