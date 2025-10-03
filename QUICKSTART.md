# Quick Start Guide

Get the Asteroid Impact Simulator running in 5 minutes!

## Prerequisites

Make sure you have:
- ✅ Node.js (v16+) - [Download](https://nodejs.org/)
- ✅ Python (v3.8+) - [Download](https://www.python.org/)

## Installation

### Windows

1. **Open Command Prompt** in the project folder

2. **Run the launcher:**
   ```bash
   start.bat
   ```

That's it! The script will:
- Install all dependencies
- Start both servers
- Open your browser automatically

### Mac/Linux

1. **Open Terminal** in the project folder

2. **Make script executable:**
   ```bash
   chmod +x start.sh
   ```

3. **Run the launcher:**
   ```bash
   ./start.sh
   ```

## Manual Setup (Alternative)

If the launcher doesn't work:

### Step 1: Install Dependencies

```bash
# Node.js dependencies
npm install

# Python dependencies
pip install -r requirements.txt
```

### Step 2: Configure API Key

1. Copy `.env.example` to `.env`
2. Get a free NASA API key at https://api.nasa.gov/
3. Add it to `.env`:
   ```
   NASA_API_KEY=your_key_here
   ```

### Step 3: Start Servers

**Terminal 1 - Node.js:**
```bash
npm start
```

**Terminal 2 - Python:**
```bash
python app.py
```

### Step 4: Open Browser

Go to: http://localhost:3000

## First Steps

1. **Explore Presets:** Try "Chelyabinsk" or "Tunguska" scenarios
2. **Adjust Parameters:** Use sliders to change asteroid size and velocity
3. **Calculate Impact:** Click the blue "Calculate Impact" button
4. **Try Mitigation:** Switch to the "Mitigation" tab
5. **View NASA Data:** Scroll down to see real potentially hazardous asteroids

## Troubleshooting

### "Port already in use"
- Close other applications using ports 3000 or 5000
- Or change ports in `.env`

### "Module not found"
- Run `npm install` and `pip install -r requirements.txt` again

### "Failed to fetch NASA data"
- Check your internet connection
- Verify your NASA API key in `.env`
- The app works with DEMO_KEY but has rate limits

### 3D visualization not showing
- Try a different browser (Chrome or Firefox recommended)
- Check browser console (F12) for errors

## Need More Help?

- 📖 Read [SETUP.md](SETUP.md) for detailed instructions
- 🔬 Check [SCIENCE.md](SCIENCE.md) for scientific background
- 🎯 See [FEATURES.md](FEATURES.md) for feature documentation

## What's Next?

- Explore different asteroid scenarios
- Learn about mitigation strategies
- Share your findings with friends
- Contribute improvements (see [CONTRIBUTING.md](CONTRIBUTING.md))

---

**Enjoy exploring asteroid impacts!** 🌍☄️
