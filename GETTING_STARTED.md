# 🚀 Getting Started with Asteroid Impact Simulator

Welcome! This guide will get you up and running in **5 minutes**.

## 📋 What You Need

Before starting, make sure you have:

- ✅ **Node.js** (v16 or higher) → [Download here](https://nodejs.org/)
- ✅ **Python** (v3.8 or higher) → [Download here](https://www.python.org/)
- ✅ A **web browser** (Chrome, Firefox, or Edge)
- ✅ **Internet connection** (for NASA data)

## 🎯 Quick Start (Easiest Method)

### Windows Users

1. **Open Command Prompt** in the project folder
2. **Double-click** `start.bat` or run:
   ```cmd
   start.bat
   ```
3. **Wait** for servers to start (about 10 seconds)
4. **Browser opens automatically** at http://localhost:3000

### Mac/Linux Users

1. **Open Terminal** in the project folder
2. **Make script executable:**
   ```bash
   chmod +x start.sh
   ```
3. **Run the launcher:**
   ```bash
   ./start.sh
   ```
4. **Browser opens automatically** at http://localhost:3000

## 🛠️ Manual Setup (If Launcher Fails)

### Step 1: Install Dependencies

Open **two terminals** in the project folder.

**Terminal 1 - Install Node.js packages:**
```bash
npm install
```

**Terminal 2 - Install Python packages:**
```bash
pip install -r requirements.txt
```

### Step 2: Configure NASA API Key (Optional)

1. Get a **free API key** at https://api.nasa.gov/
2. Copy `.env.example` to `.env`
3. Edit `.env` and add your key:
   ```
   NASA_API_KEY=your_key_here
   ```

**Note:** The app works with `DEMO_KEY` but has rate limits.

### Step 3: Start Servers

Keep both terminals open!

**Terminal 1 - Start Node.js server:**
```bash
npm start
```

You should see:
```
🚀 Asteroid Impact Simulator Server running on http://localhost:3000
```

**Terminal 2 - Start Flask server:**
```bash
python app.py
```

You should see:
```
🧮 Starting Asteroid Impact Calculator (Flask)
🚀 Server running on http://localhost:5000
```

### Step 4: Open Browser

Go to: **http://localhost:3000**

## ✅ Verify Installation

You should see:

1. ✅ **Main interface** with blue/dark theme
2. ✅ **3D visualization** showing Earth and asteroid
3. ✅ **Parameter sliders** on the right
4. ✅ **Featured Asteroids** section at bottom (loading NASA data)
5. ✅ **No error messages** in browser console (F12)

## 🎮 Your First Simulation

Let's run a quick test!

### 1. Select a Preset Scenario

- Find the **"Preset Scenarios"** dropdown
- Select **"Chelyabinsk (2013)"**
- Parameters automatically adjust

### 2. Calculate Impact

- Click the blue **"Calculate Impact"** button
- Wait 1-2 seconds for calculations
- Results appear in cards below

### 3. View Results

You should see:
- **Impact Energy:** ~0.5 megatons TNT
- **Crater Size:** ~0.4 km diameter
- **Seismic Magnitude:** ~4.2
- **Classification:** Local threat

### 4. Try Mitigation

- Click the **"Mitigation"** tab
- Select **"Kinetic Impactor"**
- Adjust **"Deflection Time"** to 5 years
- Click **"Calculate Deflection"**
- See if Earth can be saved!

## 🎨 Explore Features

### Adjust Parameters

Try changing:
- **Diameter:** 10m to 10km (use slider)
- **Velocity:** 11 to 72 km/s
- **Density:** 1000 to 8000 kg/m³
- **Impact Angle:** 0° to 90°

### Try Other Presets

- **Tunguska (1908):** 60m asteroid, 10-15 MT
- **City Killer:** 150m asteroid, regional threat
- **Extinction Event:** 10km asteroid, global catastrophe

### Explore NASA Data

Scroll down to **"Featured Asteroids"**:
- See real potentially hazardous asteroids
- Click any card to load its parameters
- Calculate what would happen if it hit Earth

### 3D Visualization

- Watch the **asteroid orbit** around Earth
- Toggle between **Orbit** and **Impact** views
- See the **animated trajectory**

## 📚 Learn More

### Documentation

- **[README.md](README.md)** - Project overview
- **[FEATURES.md](FEATURES.md)** - Complete feature list
- **[SCIENCE.md](SCIENCE.md)** - Scientific background
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference

### Tutorials

1. **Understanding Impact Energy**
   - Adjust diameter from 10m to 1km
   - Watch energy increase exponentially
   - Compare to Hiroshima bombs

2. **Crater Scaling**
   - Try different angles (0° to 90°)
   - See how angle affects crater size
   - Learn about oblique impacts

3. **Mitigation Strategies**
   - Compare kinetic impactor vs gravity tractor
   - See how warning time affects success
   - Understand delta-V requirements

## 🐛 Troubleshooting

### Problem: "Port already in use"

**Solution:** Another app is using port 3000 or 5000.

```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Mac/Linux - Find and kill process
lsof -ti:3000 | xargs kill -9
```

Or change ports in `.env`:
```
PORT=3001
FLASK_PORT=5001
```

### Problem: "Module not found"

**Solution:** Dependencies not installed.

```bash
# Reinstall Node.js packages
npm install

# Reinstall Python packages
pip install -r requirements.txt
```

### Problem: "Failed to fetch NASA data"

**Solution:** Check internet and API key.

1. Test internet: Open https://api.nasa.gov/
2. Verify API key in `.env`
3. Try with `DEMO_KEY` first
4. Wait if rate limited (30 req/hour for DEMO_KEY)

### Problem: "3D visualization not showing"

**Solution:** Browser compatibility.

1. Try **Chrome** or **Firefox** (best WebGL support)
2. Check browser console (F12) for errors
3. Update graphics drivers
4. Try incognito/private mode

### Problem: "Calculate button does nothing"

**Solution:** Flask server not running.

1. Check Terminal 2 - Flask should be running
2. Verify Flask is on port 5000
3. Check browser console for errors
4. Try restarting Flask server

### Problem: Python packages won't install

**Solution:** Use virtual environment.

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

## 💡 Tips & Tricks

### Performance Tips

1. **Close unnecessary tabs** for better 3D performance
2. **Use Chrome or Firefox** for best WebGL support
3. **Get a personal NASA API key** to avoid rate limits
4. **Reduce asteroid size** if rendering is slow

### Learning Tips

1. **Start with presets** to understand typical scenarios
2. **Compare results** by changing one parameter at a time
3. **Read tooltips** (hover over ℹ️ icons)
4. **Check the science** in SCIENCE.md for formulas

### Advanced Usage

1. **Use browser DevTools** (F12) to see API calls
2. **Test API directly** with curl or Postman
3. **Modify parameters** in app.js for custom behavior
4. **Add your own presets** in the samples array

## 🎯 Next Steps

Now that you're set up:

1. ✅ **Explore all presets** (5 scenarios)
2. ✅ **Try mitigation strategies** (4 methods)
3. ✅ **Check NASA data** (real asteroids)
4. ✅ **Read the science** (SCIENCE.md)
5. ✅ **Share with friends** (it's educational!)

## 🤝 Get Help

If you're still stuck:

1. **Check [SETUP.md](SETUP.md)** for detailed instructions
2. **Review [TROUBLESHOOTING](#-troubleshooting)** above
3. **Open browser console** (F12) for error messages
4. **Check server logs** in terminals
5. **Open an issue** on GitHub (if applicable)

## 🌟 Have Fun!

You're all set! Start exploring asteroid impacts and learn about planetary defense.

**Remember:** This is a simulation tool for education. For real asteroid threats, NASA's CNEOS is the authoritative source.

---

**Happy asteroid hunting!** 🌍☄️🛡️

**Questions?** Check the documentation or open an issue.

**Enjoying the app?** Star the repo and share with others!
