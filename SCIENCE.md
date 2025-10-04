# Scientific Background

This document explains the scientific principles and formulas used in the Asteroid Impact Simulator.

## Table of Contents
1. [Orbital Mechanics](#orbital-mechanics)
2. [Impact Energy](#impact-energy)
3. [Crater Formation](#crater-formation)
4. [Environmental Effects](#environmental-effects)
5. [Deflection Strategies](#deflection-strategies)
6. [References](#references)

---

## Orbital Mechanics

### Keplerian Orbital Elements

Asteroids follow elliptical orbits described by six parameters:

1. **Semi-major axis (a):** Half the longest diameter of the ellipse
2. **Eccentricity (e):** Shape of the orbit (0 = circle, 1 = parabola)
3. **Inclination (i):** Tilt of orbit relative to ecliptic plane
4. **Longitude of ascending node (Ω):** Where orbit crosses ecliptic
5. **Argument of periapsis (ω):** Orientation of ellipse
6. **True anomaly (ν):** Position along orbit

### Position Calculation

To convert orbital elements to 3D position:

```
r = a(1 - e²) / (1 + e·cos(ν))

x_orb = r·cos(ν)
y_orb = r·sin(ν)

Then apply rotation matrices for ω, i, and Ω
```

### Orbital Period

Kepler's Third Law:

```
T² = (4π²/GM) × a³

Where:
- T = orbital period
- G = gravitational constant
- M = mass of Sun
- a = semi-major axis
```

### Velocity

Vis-viva equation:

```
v² = GM(2/r - 1/a)

Where:
- v = orbital velocity
- r = current distance from Sun
- a = semi-major axis
```

### Earth Approach

An asteroid approaches Earth when:
- Orbit intersects Earth's orbit
- Both objects at intersection point simultaneously
- Relative velocity determines impact speed

Typical NEO velocities: 11-72 km/s

---

## Impact Energy

### Kinetic Energy

```
KE = ½mv²

Where:
- m = mass (kg)
- v = velocity (m/s)
```

### Mass Calculation

```
m = ρV = ρ(4/3)πr³

Where:
- ρ = density (kg/m³)
- r = radius (m)
```

**Typical densities:**
- C-type (carbonaceous): 1,000-2,000 kg/m³
- S-type (silicaceous): 2,000-3,500 kg/m³
- M-type (metallic): 3,500-8,000 kg/m³

### TNT Equivalent

```
Energy (MT) = KE / (4.184 × 10¹⁵ J)

Where:
- 1 megaton TNT = 4.184 × 10¹⁵ J
- Hiroshima bomb ≈ 15 kilotons = 0.015 MT
```

### Energy Examples

| Diameter | Velocity | Energy | Comparison |
|----------|----------|--------|------------|
| 20m | 19 km/s | 0.5 MT | Chelyabinsk 2013 |
| 60m | 15 km/s | 10 MT | Tunguska 1908 |
| 150m | 25 km/s | 1,000 MT | City killer |
| 1km | 20 km/s | 100,000 MT | Regional devastation |
| 10km | 30 km/s | 100M MT | Chicxulub (dinosaurs) |

---

## Crater Formation

### Scaling Laws

Based on Holsapple & Housen (2007):

```
D = C × ρₐ^α × ρₜ^β × g^γ × L^δ × v^ε × sin(θ)^ζ

Where:
- D = crater diameter
- ρₐ = projectile density
- ρₜ = target density
- g = surface gravity
- L = projectile diameter
- v = impact velocity
- θ = impact angle
```

**Exponents for competent rock:**
- α ≈ 0.11
- β ≈ -0.33
- γ ≈ -0.22
- δ ≈ 0.13
- ε ≈ 0.44
- ζ ≈ 0.33

### Simplified Formula

```
D ≈ 1.8 × (ρₐ/ρₜ)^(1/3) × L^1.056 × (v/1000)^0.44 × sin(θ)^(1/3) × g^(-0.22)
```

### Crater Depth

```
d ≈ D/3

Where:
- d = crater depth
- D = crater diameter
```

### Crater Volume

```
V ≈ (π/3) × (D/2)² × d

Assuming parabolic profile
```

### Ejecta Blanket

```
R_ejecta ≈ 2.5 × D

Where material is thrown from crater
```

### Notable Craters

| Crater | Diameter | Age | Impactor Size |
|--------|----------|-----|---------------|
| Meteor Crater, AZ | 1.2 km | 50,000 yr | ~50m |
| Barringer | 1.2 km | 50,000 yr | ~50m |
| Chicxulub, Mexico | 180 km | 66M yr | ~10km |
| Vredefort, S. Africa | 300 km | 2B yr | ~15km |

---

## Environmental Effects

### Seismic Effects

Magnitude estimation:

```
M = 0.67 × log₁₀(E) - 5.87

Where:
- M = Richter magnitude
- E = energy in Joules
```

**Magnitude scale:**
- M < 4: Minor, felt locally
- M 4-5: Light, minor damage
- M 5-6: Moderate, significant damage
- M 6-7: Strong, major damage
- M 7-8: Great, serious damage
- M > 8: Catastrophic

### Air Blast

Overpressure zones:

```
P = K × (E^(1/3) / R)

Where:
- P = overpressure (psi)
- E = energy (MT)
- R = distance (km)
- K = constant
```

**Damage levels:**
- 20 psi: Severe structural damage
- 5 psi: Moderate damage, injuries
- 1 psi: Window breakage

**Radius estimates:**
```
R_severe ≈ 0.23 × E^(1/3) km
R_moderate ≈ 0.54 × E^(1/3) km
```

### Thermal Radiation

Fireball radius:

```
R_fireball ≈ 0.28 × E^(1/3) km
```

3rd degree burn radius:

```
R_thermal ≈ 0.66 × E^0.41 km
```

### Tsunami Generation

For ocean impacts:

**Wave height at generation:**
```
H₀ ≈ 0.1 × D_crater

Where D_crater is in meters
```

**Wave height at distance:**
```
H(r) = H₀ × (r₀/r)^(1/2)

Where:
- r = distance from impact
- r₀ = initial radius
```

**Tsunami potential:**
- Diameter > 100m: High risk
- Diameter 50-100m: Moderate risk
- Diameter < 50m: Low risk

### Atmospheric Effects

**Dust injection:**
```
M_dust ≈ 1000 × M_impactor

For high-velocity impacts
```

**Climate impact:**
- <1 km: Regional cooling, weeks
- 1-5 km: Global cooling, months-years
- >5 km: Impact winter, years-decades

**Extinction threshold:**
- ~10 km diameter
- ~100 million MT energy
- Global firestorms
- Years of darkness
- Mass extinction

---

## Deflection Strategies

### Kinetic Impactor

**Concept:** Crash spacecraft into asteroid

**Delta-V calculation:**
```
Δv = (m_imp × v_imp × β) / m_ast

Where:
- m_imp = impactor mass
- v_imp = impact velocity
- β = momentum enhancement (2-5)
- m_ast = asteroid mass
```

**Beta factor:** Accounts for ejecta momentum
- β ≈ 1: Perfect inelastic collision
- β ≈ 2-5: With ejecta enhancement

**Example: DART Mission**
- Impactor: 570 kg
- Velocity: 6.6 km/s
- Target: Dimorphos (160m)
- Result: ~4 mm/s Δv, β ≈ 3.6

### Gravity Tractor

**Concept:** Use spacecraft gravity to pull asteroid

**Delta-V calculation:**
```
Δv = (G × M_sc × t) / (r² × M_ast)

Where:
- G = gravitational constant
- M_sc = spacecraft mass
- t = tractor time
- r = separation distance
- M_ast = asteroid mass
```

**Advantages:**
- Very precise
- No debris
- Continuous adjustment

**Disadvantages:**
- Very slow
- Requires years
- Large spacecraft needed

### Laser Ablation

**Concept:** Vaporize surface to create thrust

**Delta-V calculation:**
```
Δv = v_exhaust × ln(m_i / m_f)

Where:
- v_exhaust ≈ 1000 m/s (typical)
- m_i = initial mass
- m_f = final mass
```

**Mass ablation rate:**
```
dm/dt = η × P / E_vap

Where:
- η = efficiency (~10%)
- P = laser power
- E_vap = vaporization energy (~2.5 MJ/kg)
```

### Nuclear Deflection

**Concept:** Standoff nuclear detonation

**Delta-V calculation:**
```
Δv = √(2 × E_coupled / m_ast)

Where:
- E_coupled = η × E_nuke
- η ≈ 0.01 (1% coupling)
- E_nuke = nuclear yield
```

**Standoff distance:**
```
r_standoff ≈ 3 × D_ast

To avoid fragmentation
```

**Advantages:**
- Most powerful
- Short warning time
- Proven technology

**Disadvantages:**
- Political issues
- Fragmentation risk
- Radioactive debris

### Deflection Requirements

**Minimum Δv to miss Earth:**
```
Δv_min = R_Earth / t

Where:
- R_Earth = 6,371 km
- t = time to impact (seconds)
```

**Example:**
- 10 years warning: 0.02 mm/s
- 5 years warning: 0.04 mm/s
- 1 year warning: 0.2 mm/s

**Warning time vs. strategy:**
- 20+ years: Gravity tractor
- 10-20 years: Kinetic impactor
- 5-10 years: Multiple kinetic impactors
- 1-5 years: Nuclear deflection
- <1 year: Evacuation only

---

## References

### Scientific Papers

1. **Holsapple, K. A., & Housen, K. R. (2007)**
   "A crater and its ejecta: An interpretation of Deep Impact"
   *Icarus*, 187(1), 345-356.

2. **Collins, G. S., et al. (2005)**
   "Earth Impact Effects Program"
   *Meteoritics & Planetary Science*, 40(6), 817-840.

3. **Ahrens, T. J., & Harris, A. W. (1992)**
   "Deflection and fragmentation of near-Earth asteroids"
   *Nature*, 360, 429-433.

4. **Cheng, A. F., et al. (2023)**
   "Momentum transfer from the DART mission kinetic impact"
   *Nature*, 616, 457-460.

### NASA Resources

- **NEO Program:** https://cneos.jpl.nasa.gov/
- **Eyes on Asteroids:** https://eyes.nasa.gov/apps/asteroids/
- **Horizons System:** https://ssd.jpl.nasa.gov/horizons/
- **Impact Risk:** https://cneos.jpl.nasa.gov/sentry/

### Impact Calculators

- **Earth Impact Effects Program:** https://impact.ese.ic.ac.uk/ImpactEarth/
- **Impact Calculator:** https://www.purdue.edu/impactearth/

### Planetary Defense

- **Planetary Defense Coordination Office (PDCO)**
- **International Asteroid Warning Network (IAWN)**
- **Space Mission Planning Advisory Group (SMPAG)**

### Historical Events

- **Tunguska (1908):** 60m asteroid, 10-15 MT
- **Chelyabinsk (2013):** 20m asteroid, 0.5 MT
- **Chicxulub (66 Ma):** 10km asteroid, 100M MT

---

## Assumptions and Limitations

### Simplifications

1. **Two-body problem:** Ignores other planets
2. **Spherical asteroids:** Real asteroids are irregular
3. **Homogeneous density:** Asteroids may have voids
4. **Vertical target:** Earth's surface assumed flat
5. **No atmosphere:** For space calculations
6. **Instantaneous deflection:** Gradual in reality

### Uncertainties

- Asteroid composition: ±50%
- Impact angle: Most probable 45°
- Crater scaling: ±factor of 2
- Deflection efficiency: ±50%
- Environmental effects: Order of magnitude

### Model Validity

**Valid for:**
- Solid rocky/metallic asteroids
- Competent rock targets
- Velocities 11-72 km/s
- Diameters 10m - 10km

**Not valid for:**
- Rubble pile asteroids (different physics)
- Comets (different composition)
- Very low/high velocities
- Atmospheric breakup (requires CFD)

---

## Educational Notes

This simulator uses established scientific models but makes simplifications for:
- Computational efficiency
- Educational clarity
- Real-time interaction

For actual planetary defense, much more detailed modeling would be required:
- N-body orbital dynamics
- Detailed asteroid characterization
- High-fidelity impact simulations
- Atmospheric entry modeling
- Regional damage assessment

**This tool is for educational purposes and should not be used for actual planetary defense planning.**

---

**Last updated:** 2025-10-01
**Version:** 1.0
