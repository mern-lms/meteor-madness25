# 🎯 Impact Risk Assessment Guide

## Overview

The Asteroid Impact Simulator now includes comprehensive **impact risk assessment** data from NASA's Sentry system and displays **ALL asteroids** (not just near-Earth objects), including main belt asteroids, trojans, and distant objects.

## 🌍 Data Sources

### 1. **NASA Sentry System**
**URL:** `https://ssd-api.jpl.nasa.gov/sentry.api`

**What it provides:**
- Impact probability for potentially hazardous asteroids
- Torino Scale ratings (0-10)
- Palermo Scale ratings
- Possible impact dates
- Number of possible impacts
- Last observation date

**About Sentry:**
- Automated collision monitoring system
- Continuously scans asteroid catalog
- Identifies objects with potential Earth impacts
- Calculates impact probabilities over 100 years

### 2. **Small-Body Database (SBDB)**
**URL:** `https://ssd-api.jpl.nasa.gov/sbdb_query.api`

**What it provides:**
- ALL known asteroids (not just NEOs)
- Main belt asteroids
- Trojan asteroids
- Distant objects
- Orbital elements
- Physical properties

### 3. **Close Approach Data (CAD)**
**URL:** `https://ssd-api.jpl.nasa.gov/cad.api`

**What it provides:**
- All close approaches to Earth
- Approach dates
- Miss distances
- Relative velocities
- Historical and future approaches

### 4. **NEO REST API**
**URL:** `https://api.nasa.gov/neo/rest/v1`

**What it provides:**
- Near-Earth Object data
- Potentially Hazardous Asteroids (PHAs)
- Detailed orbital information
- Size estimates

## 📊 Risk Scales Explained

### Torino Scale (0-10)

**Purpose:** Communicate impact hazard to the public

| Level | Color | Description | Action |
|-------|-------|-------------|--------|
| 0 | White | No hazard | Routine discovery |
| 1 | Green | Normal | Routine monitoring |
| 2-4 | Yellow | Merits attention | Astronomers' attention |
| 5-7 | Orange | Threatening | Government planning |
| 8-10 | Red | Certain collision | International action |

**Current Status:**
- No asteroid currently rated above 0
- Apophis was briefly rated 4 (now 0)
- Most objects are 0 or 1

### Palermo Scale

**Purpose:** Technical assessment for astronomers

**Formula:**
```
PS = log₁₀(Pi / Pb)
```
Where:
- Pi = Impact probability
- Pb = Background probability

**Interpretation:**
- **PS < -2**: No concern
- **PS -2 to 0**: Monitoring needed
- **PS > 0**: Serious concern

**Example:**
- PS = -3: 1/1000 of background risk
- PS = 0: Equal to background risk
- PS = +2: 100x background risk

### Impact Probability

**How it's calculated:**
1. Observe asteroid position
2. Calculate orbital uncertainty
3. Project orbit forward
4. Check for Earth intersections
5. Calculate probability

**Typical values:**
- Most asteroids: < 1 in 1,000,000
- Monitored objects: 1 in 10,000 to 1 in 100,000
- High concern: > 1 in 10,000

**Example interpretations:**
- **1 in 10**: 10% chance (VERY HIGH - would be global emergency)
- **1 in 1,000**: 0.1% chance (High concern)
- **1 in 100,000**: 0.001% chance (Monitoring)
- **1 in 10,000,000**: 0.00001% chance (Routine)

## 🎯 Using the Impact Risk Features

### Viewing Risk Data

**1. Load the Application**
- Asteroids automatically load from multiple NASA sources
- Console shows loading progress
- Check browser console (F12) for detailed logs

**2. Check Impact Risk Summary**
Console output shows:
```
=== Impact Risk Summary ===
Total asteroids: 150
Potentially Hazardous: 25
With impact probability: 12
Torino Scale ≥ 1: 3
```

**3. Browse Asteroids**
- Scroll to "All Tracked Asteroids" section
- Asteroids marked with:
  - 🔴 Red icon: Potentially Hazardous
  - 🟢 Green icon: Not hazardous
  - ⚠️ Orange badge: Sentry risk object
  - 📍 Purple badge: Main belt / far asteroid

**4. Select an Asteroid**
- Click any asteroid card or 3D object
- Details panel appears on right side

**5. View Risk Assessment**
If asteroid has impact risk data, you'll see:
- **Risk Level**: Low / Moderate / High
- **Impact Probability**: Percentage and odds
- **Torino Scale**: 0-10 rating
- **Palermo Scale**: Technical rating
- **Possible Impacts**: Number of potential impacts
- **Earliest Impact**: Year of first possible impact
- **Last Observed**: When last tracked

### Understanding the Display

**Risk Level Colors:**
- 🟢 **Green (Low Risk)**: Torino 0, very low probability
- 🟡 **Yellow (Moderate Risk)**: Torino 1 or probability > 0.001%
- 🔴 **Red (High Risk)**: Torino ≥ 2

**Asteroid Types:**
- **NEO**: Near-Earth Object (orbit brings it close to Earth)
- **PHA**: Potentially Hazardous Asteroid (>140m and <0.05 AU)
- **Sentry Object**: Has calculated impact probability
- **Main Belt**: Orbits between Mars and Jupiter
- **Trojan**: Shares orbit with Jupiter

## 📈 Real Examples

### Example 1: Bennu
```
Name: (101955) Bennu
Impact Probability: 1 in 2,700
Torino Scale: 0
Palermo Scale: -1.7
Possible Impacts: 78
Earliest Impact: 2178
Status: Monitored, OSIRIS-REx mission target
```

### Example 2: Apophis
```
Name: (99942) Apophis
Impact Probability: 0 (ruled out for 2029, 2036)
Torino Scale: 0 (was 4 in 2004)
Close Approach: April 13, 2029 (31,000 km)
Status: Will pass inside satellite orbits
```

### Example 3: 2023 DW (Hypothetical High Risk)
```
Name: 2023 DW
Impact Probability: 1 in 625
Torino Scale: 1
Palermo Scale: -2.18
Possible Impacts: 1
Earliest Impact: 2046
Status: Needs more observations
```

## 🔍 Filtering and Sorting

### Current Capabilities

**All asteroids displayed:**
- Near-Earth Objects (NEOs)
- Potentially Hazardous Asteroids (PHAs)
- Main Belt asteroids
- Sentry risk objects
- Far asteroids (Jupiter trojans, etc.)

**Data merged from:**
- NEO API: 50 objects
- Sentry: All risk objects
- CAD: Close approaches
- SBDB: 100 additional asteroids
- **Total: 150+ asteroids**

### Future Filtering (Planned)

- Filter by risk level
- Filter by Torino Scale
- Filter by impact probability
- Filter by distance from Earth
- Filter by size
- Sort by various criteria

## 🎓 Educational Value

### Learning Objectives

**Students can:**
1. Understand impact probability
2. Learn risk assessment scales
3. Compare different asteroids
4. See real NASA monitoring data
5. Understand orbital mechanics

**Teachers can:**
1. Demonstrate risk assessment
2. Explain probability concepts
3. Show real-world data science
4. Discuss planetary defense
5. Engage with current events

### Lesson Ideas

**Lesson 1: Understanding Probability**
- Compare impact probabilities
- Calculate odds
- Understand risk vs. certainty
- Relate to everyday probabilities

**Lesson 2: Risk Scales**
- Learn Torino Scale
- Understand Palermo Scale
- Compare different asteroids
- Discuss communication strategies

**Lesson 3: Planetary Defense**
- Identify high-risk objects
- Evaluate mitigation strategies
- Understand observation importance
- Discuss international cooperation

## 🚨 What If an Asteroid Has High Risk?

### Real-World Response

**If Torino Scale ≥ 2:**
1. **Immediate Actions:**
   - Intensive observation campaign
   - Refine orbital calculations
   - International coordination
   - Public communication

2. **Assessment Phase:**
   - Calculate impact probability
   - Determine impact location
   - Estimate impact effects
   - Evaluate mitigation options

3. **Decision Phase:**
   - Choose deflection strategy
   - Plan mission timeline
   - Coordinate international response
   - Prepare contingency plans

4. **Implementation:**
   - Launch deflection mission
   - Monitor asteroid response
   - Adjust as needed
   - Prepare for all outcomes

### Historical Cases

**2004 MN4 (Apophis):**
- Initially rated Torino 4
- 2.7% impact probability for 2029
- Refined observations reduced risk
- Now rated Torino 0
- **Lesson:** More data reduces uncertainty

**2023 DW:**
- Briefly rated Torino 1
- 1 in 625 impact probability
- Additional observations reduced risk
- **Lesson:** Initial assessments can be uncertain

## 📊 Statistics

### Current Asteroid Population

**Known Asteroids:**
- Total: ~1,000,000+
- NEOs: ~30,000
- PHAs: ~2,000
- Sentry objects: ~1,500

**Size Distribution:**
- >1 km: ~1,000 NEOs (90% found)
- 140m-1km: ~25,000 NEOs (40% found)
- <140m: Millions (few % found)

**Impact Frequency:**
- >1 km: Once per 500,000 years
- >140m: Once per 20,000 years
- >50m: Once per 1,000 years
- >20m: Once per 100 years

## 🔧 Technical Details

### API Integration

**Parallel Loading:**
```javascript
Promise.allSettled([
    NEO API,
    Sentry API,
    CAD API,
    SBDB API
])
```

**Data Merging:**
1. Load NEO data (base)
2. Merge Sentry risk data
3. Add close approach data
4. Include SBDB asteroids
5. Remove duplicates
6. Sort by risk level

### Risk Calculation

**Impact Probability:**
- From NASA Sentry system
- Based on orbital uncertainty
- Updated with new observations
- Projected over 100 years

**Torino Scale:**
- Calculated from probability and energy
- Considers impact effects
- Designed for public communication

**Palermo Scale:**
- Compares to background risk
- Technical assessment
- Used by astronomers

## 🐛 Troubleshooting

### No Risk Data Showing

**Problem:** Asteroid has no Sentry data  
**Reason:** Most asteroids have zero impact risk  
**Solution:** This is normal - only ~1,500 objects have risk data

### API Errors

**Problem:** Failed to load Sentry data  
**Reason:** API might be temporarily unavailable  
**Solution:** App still works with NEO data; Sentry is supplemental

### Missing Asteroids

**Problem:** Can't find specific asteroid  
**Reason:** Limited to 150 asteroids for performance  
**Solution:** Increase limit in code or search NASA's website directly

## 📚 Resources

**NASA Resources:**
- Sentry System: https://cneos.jpl.nasa.gov/sentry/
- NEO Program: https://cneos.jpl.nasa.gov/
- Impact Risk: https://cneos.jpl.nasa.gov/about/impact_risk.html

**Risk Scales:**
- Torino Scale: https://cneos.jpl.nasa.gov/sentry/torino_scale.html
- Palermo Scale: https://cneos.jpl.nasa.gov/sentry/palermo_scale.html

**APIs:**
- Sentry API: https://ssd-api.jpl.nasa.gov/doc/sentry.html
- SBDB API: https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html
- CAD API: https://ssd-api.jpl.nasa.gov/doc/cad.html

## 🎯 Key Takeaways

1. **Most asteroids have zero impact risk** - This is good news!
2. **Sentry monitors ~1,500 objects** - Continuous surveillance
3. **More observations reduce uncertainty** - Why tracking matters
4. **No current high-risk objects** - We're safe for now
5. **Planetary defense is possible** - We have options

---

**Stay informed, stay safe, and remember: we're watching the skies!** 🌍🔭☄️
