// ==================== Machine Learning Impact Optimizer ====================
// AI-powered impact prediction and deflection strategy optimization

class MLImpactOptimizer {
    constructor() {
        this.isInitialized = false;
        this.models = {
            impactPredictor: null,
            deflectionOptimizer: null,
            riskAssessment: null
        };
        
        // Training data for impact scenarios (simplified - in real app would use extensive datasets)
        this.trainingData = {
            impacts: [
                // Historical events
                { diameter: 20, velocity: 19, density: 2700, angle: 45, energy: 0.5, craterSize: 0.02, casualties: 1500 },
                { diameter: 60, velocity: 15, density: 2000, angle: 30, energy: 15, craterSize: 0.1, casualties: 0 },
                { diameter: 10000, velocity: 30, density: 3000, angle: 45, energy: 100000000, craterSize: 150, casualties: 75000000000 },
                
                // Simulated scenarios
                { diameter: 100, velocity: 20, density: 3000, angle: 45, energy: 50, craterSize: 1.2, casualties: 100000 },
                { diameter: 150, velocity: 25, density: 2800, angle: 60, energy: 200, craterSize: 2.1, casualties: 500000 },
                { diameter: 300, velocity: 30, density: 3200, angle: 45, energy: 2000, craterSize: 8.5, casualties: 10000000 },
                { diameter: 500, velocity: 35, density: 3500, angle: 30, energy: 15000, craterSize: 25, casualties: 50000000 },
                { diameter: 1000, velocity: 40, density: 4000, angle: 45, energy: 500000, craterSize: 80, casualties: 1000000000 }
            ],
            
            deflections: [
                // Successful deflection scenarios
                { diameter: 150, velocity: 25, warningTime: 730, method: 'kinetic', success: 0.95, deltaV: 0.05 },
                { diameter: 300, velocity: 20, warningTime: 1095, method: 'gravity', success: 0.88, deltaV: 0.02 },
                { diameter: 100, velocity: 30, warningTime: 365, method: 'kinetic', success: 0.75, deltaV: 0.08 },
                { diameter: 500, velocity: 35, warningTime: 180, method: 'nuclear', success: 0.60, deltaV: 0.15 },
                { diameter: 50, velocity: 15, warningTime: 1460, method: 'laser', success: 0.92, deltaV: 0.03 }
            ]
        };
        
        this.neuralNetwork = null;
        this.optimizationHistory = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        // Initialize simplified neural network (using basic JavaScript implementation)
        this.neuralNetwork = new SimpleNeuralNetwork([4, 8, 6, 3]); // 4 inputs, 3 outputs
        
        // Train the models
        await this.trainModels();
        
        this.isInitialized = true;
        console.log('🤖 ML Impact Optimizer initialized');
    }

    async trainModels() {
        console.log('🧠 Training ML models...');
        
        // Prepare training data for impact prediction
        const impactTrainingData = this.trainingData.impacts.map(impact => ({
            inputs: [
                impact.diameter / 1000, // Normalize diameter
                impact.velocity / 50,   // Normalize velocity
                impact.density / 5000,  // Normalize density
                impact.angle / 90       // Normalize angle
            ],
            outputs: [
                Math.log10(impact.energy + 1) / 10,     // Log-normalized energy
                Math.log10(impact.craterSize + 1) / 3,  // Log-normalized crater size
                Math.log10(impact.casualties + 1) / 12  // Log-normalized casualties
            ]
        }));
        
        // Train neural network
        for (let epoch = 0; epoch < 1000; epoch++) {
            for (const data of impactTrainingData) {
                this.neuralNetwork.train(data.inputs, data.outputs, 0.1);
            }
        }
        
        console.log('✅ ML models trained successfully');
    }

    predictImpactEffects(diameter, velocity, density, angle) {
        if (!this.isInitialized) {
            console.warn('ML Optimizer not initialized');
            return null;
        }
        
        const inputs = [
            diameter / 1000,
            velocity / 50,
            density / 5000,
            angle / 90
        ];
        
        const outputs = this.neuralNetwork.predict(inputs);
        
        // Denormalize outputs
        const predictedEnergy = Math.pow(10, outputs[0] * 10) - 1;
        const predictedCraterSize = Math.pow(10, outputs[1] * 3) - 1;
        const predictedCasualties = Math.pow(10, outputs[2] * 12) - 1;
        
        return {
            energy: predictedEnergy,
            craterSize: predictedCraterSize,
            casualties: Math.round(predictedCasualties),
            confidence: this.calculateConfidence(inputs)
        };
    }

    calculateConfidence(inputs) {
        // Simple confidence calculation based on how close inputs are to training data
        let minDistance = Infinity;
        
        for (const impact of this.trainingData.impacts) {
            const trainingInputs = [
                impact.diameter / 1000,
                impact.velocity / 50,
                impact.density / 5000,
                impact.angle / 90
            ];
            
            const distance = Math.sqrt(
                inputs.reduce((sum, val, i) => sum + Math.pow(val - trainingInputs[i], 2), 0)
            );
            
            minDistance = Math.min(minDistance, distance);
        }
        
        return Math.max(0.1, Math.min(0.99, 1 - minDistance));
    }

    optimizeDeflectionStrategy(asteroid, warningTime) {
        const strategies = [
            { name: 'Kinetic Impactor', method: 'kinetic', cost: 500, timeRequired: 365 },
            { name: 'Gravity Tractor', method: 'gravity', cost: 2000, timeRequired: 1095 },
            { name: 'Laser Ablation', method: 'laser', cost: 1500, timeRequired: 730 },
            { name: 'Nuclear Deflection', method: 'nuclear', cost: 5000, timeRequired: 180 }
        ];
        
        const optimizedStrategies = strategies.map(strategy => {
            const successProbability = this.calculateSuccessProbability(asteroid, warningTime, strategy);
            const effectiveness = this.calculateEffectiveness(asteroid, strategy);
            const feasibility = warningTime >= strategy.timeRequired ? 1.0 : warningTime / strategy.timeRequired;
            
            const score = (successProbability * 0.4 + effectiveness * 0.3 + feasibility * 0.3) / strategy.cost * 1000;
            
            return {
                ...strategy,
                successProbability,
                effectiveness,
                feasibility,
                score,
                recommendation: this.generateRecommendation(strategy, successProbability, feasibility)
            };
        });
        
        return optimizedStrategies.sort((a, b) => b.score - a.score);
    }

    calculateSuccessProbability(asteroid, warningTime, strategy) {
        // Simplified success probability calculation
        const sizeFactors = {
            kinetic: Math.max(0.2, 1 - asteroid.diameter / 500),
            gravity: Math.max(0.3, 1 - asteroid.diameter / 1000),
            laser: Math.max(0.1, 1 - asteroid.diameter / 100),
            nuclear: Math.max(0.5, 1 - asteroid.diameter / 2000)
        };
        
        const timeFactors = {
            kinetic: Math.min(1.0, warningTime / 365),
            gravity: Math.min(1.0, warningTime / 1095),
            laser: Math.min(1.0, warningTime / 730),
            nuclear: Math.min(1.0, warningTime / 180)
        };
        
        const velocityFactor = Math.max(0.5, 1 - (asteroid.velocity - 20) / 50);
        
        return sizeFactors[strategy.method] * timeFactors[strategy.method] * velocityFactor;
    }

    calculateEffectiveness(asteroid, strategy) {
        const mass = (4/3) * Math.PI * Math.pow(asteroid.diameter/2, 3) * asteroid.density;
        
        const effectivenessFactors = {
            kinetic: Math.min(1.0, 1000000 / mass), // More effective on smaller asteroids
            gravity: Math.min(1.0, 500000 / mass),  // Very precise but slow
            laser: Math.min(1.0, 100000 / mass),    // Only effective on very small asteroids
            nuclear: Math.min(1.0, 10000000 / mass) // Most powerful but risky
        };
        
        return effectivenessFactors[strategy.method] || 0.5;
    }

    generateRecommendation(strategy, successProbability, feasibility) {
        if (feasibility < 0.5) {
            return `⚠️ Insufficient time for ${strategy.name}`;
        } else if (successProbability > 0.8) {
            return `✅ Highly recommended - ${Math.round(successProbability * 100)}% success rate`;
        } else if (successProbability > 0.6) {
            return `⚡ Good option - ${Math.round(successProbability * 100)}% success rate`;
        } else if (successProbability > 0.4) {
            return `⚠️ Moderate risk - ${Math.round(successProbability * 100)}% success rate`;
        } else {
            return `❌ High risk - ${Math.round(successProbability * 100)}% success rate`;
        }
    }

    analyzeRiskFactors(asteroid, impactLocation) {
        const riskFactors = {
            size: this.categorizeSizeRisk(asteroid.diameter),
            velocity: this.categorizeVelocityRisk(asteroid.velocity),
            composition: this.categorizeCompositionRisk(asteroid.density),
            location: this.categorizeLocationRisk(impactLocation),
            warning: this.categorizeWarningTimeRisk(asteroid.warningTime || 365)
        };
        
        const overallRisk = this.calculateOverallRisk(riskFactors);
        
        return {
            factors: riskFactors,
            overall: overallRisk,
            recommendations: this.generateRiskRecommendations(riskFactors, overallRisk)
        };
    }

    categorizeSizeRisk(diameter) {
        if (diameter < 50) return { level: 'Low', score: 0.2, description: 'Likely to burn up in atmosphere' };
        if (diameter < 150) return { level: 'Moderate', score: 0.4, description: 'Regional damage possible' };
        if (diameter < 500) return { level: 'High', score: 0.7, description: 'Continental effects' };
        if (diameter < 1000) return { level: 'Severe', score: 0.9, description: 'Global climate impact' };
        return { level: 'Catastrophic', score: 1.0, description: 'Mass extinction event' };
    }

    categorizeVelocityRisk(velocity) {
        if (velocity < 15) return { level: 'Low', score: 0.3, description: 'Relatively slow impact' };
        if (velocity < 25) return { level: 'Moderate', score: 0.5, description: 'Typical asteroid velocity' };
        if (velocity < 35) return { level: 'High', score: 0.7, description: 'High-energy impact' };
        return { level: 'Extreme', score: 1.0, description: 'Extremely high-energy impact' };
    }

    categorizeCompositionRisk(density) {
        if (density < 2000) return { level: 'Low', score: 0.3, description: 'Likely carbonaceous (fragile)' };
        if (density < 3500) return { level: 'Moderate', score: 0.5, description: 'Likely silicate (rocky)' };
        return { level: 'High', score: 0.8, description: 'Likely metallic (very dense)' };
    }

    categorizeLocationRisk(location) {
        // Simplified location risk based on population density
        const populationDensity = this.estimatePopulationDensity(location);
        
        if (populationDensity < 10) return { level: 'Low', score: 0.2, description: 'Remote area' };
        if (populationDensity < 100) return { level: 'Moderate', score: 0.4, description: 'Rural area' };
        if (populationDensity < 1000) return { level: 'High', score: 0.7, description: 'Urban area' };
        return { level: 'Extreme', score: 1.0, description: 'Major population center' };
    }

    categorizeWarningTimeRisk(warningTime) {
        if (warningTime > 1095) return { level: 'Low', score: 0.2, description: 'Ample time for deflection' };
        if (warningTime > 730) return { level: 'Moderate', score: 0.4, description: 'Good time for deflection' };
        if (warningTime > 365) return { level: 'High', score: 0.7, description: 'Limited deflection options' };
        return { level: 'Critical', score: 1.0, description: 'Very limited response time' };
    }

    estimatePopulationDensity(location) {
        // Simplified population density estimation
        if (!location) return 50; // Default moderate density
        
        // Major population centers (simplified)
        const majorCities = [
            { lat: 35.6762, lng: 139.6503, density: 6000 }, // Tokyo
            { lat: 40.7128, lng: -74.0060, density: 10000 }, // New York
            { lat: 51.5074, lng: -0.1278, density: 5000 },   // London
            // Add more as needed
        ];
        
        let nearestDensity = 10; // Default rural
        let minDistance = Infinity;
        
        majorCities.forEach(city => {
            const distance = Math.sqrt(
                Math.pow(location.lat - city.lat, 2) + Math.pow(location.lng - city.lng, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestDensity = city.density * Math.exp(-distance * 10); // Exponential decay
            }
        });
        
        return Math.max(1, nearestDensity);
    }

    calculateOverallRisk(riskFactors) {
        const weights = {
            size: 0.3,
            velocity: 0.2,
            composition: 0.15,
            location: 0.25,
            warning: 0.1
        };
        
        const weightedScore = Object.entries(riskFactors).reduce((sum, [factor, data]) => {
            return sum + (data.score * weights[factor]);
        }, 0);
        
        let level, description;
        if (weightedScore < 0.3) {
            level = 'Low';
            description = 'Minimal threat to human life';
        } else if (weightedScore < 0.5) {
            level = 'Moderate';
            description = 'Regional impact possible';
        } else if (weightedScore < 0.7) {
            level = 'High';
            description = 'Significant threat to populated areas';
        } else if (weightedScore < 0.9) {
            level = 'Severe';
            description = 'Continental or global effects likely';
        } else {
            level = 'Catastrophic';
            description = 'Existential threat to civilization';
        }
        
        return { level, score: weightedScore, description };
    }

    generateRiskRecommendations(riskFactors, overallRisk) {
        const recommendations = [];
        
        if (overallRisk.score > 0.7) {
            recommendations.push('🚨 Immediate international coordination required');
            recommendations.push('🛡️ Multiple deflection strategies should be prepared');
        }
        
        if (riskFactors.warning.score > 0.7) {
            recommendations.push('⏰ Limited time - prioritize fastest deflection methods');
        }
        
        if (riskFactors.location.score > 0.7) {
            recommendations.push('🏃 Evacuation planning for populated areas');
        }
        
        if (riskFactors.size.score > 0.8) {
            recommendations.push('🌍 Global climate impact mitigation planning');
        }
        
        return recommendations;
    }

    showMLAnalysis(asteroid, impactLocation) {
        const analysisContainer = this.createAnalysisContainer();
        
        // Predict impact effects
        const mlPrediction = this.predictImpactEffects(
            asteroid.diameter,
            asteroid.velocity,
            asteroid.density,
            asteroid.angle || 45
        );
        
        // Optimize deflection strategies
        const optimizedStrategies = this.optimizeDeflectionStrategy(asteroid, asteroid.warningTime || 365);
        
        // Analyze risk factors
        const riskAnalysis = this.analyzeRiskFactors(asteroid, impactLocation);
        
        this.displayAnalysis(mlPrediction, optimizedStrategies, riskAnalysis);
        analysisContainer.classList.remove('hidden');
    }

    createAnalysisContainer() {
        let container = document.getElementById('ml-analysis-container');
        if (container) return container;
        
        container = document.createElement('div');
        container.id = 'ml-analysis-container';
        container.className = 'fixed inset-0 bg-black/95 z-50 hidden overflow-y-auto p-4';
        container.innerHTML = `
            <div class="max-w-6xl mx-auto py-8">
                <div class="bg-gray-900 rounded-xl border border-purple-500/30 overflow-hidden">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
                        <div class="flex justify-between items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-white orbitron mb-2">🤖 AI Impact Analysis</h1>
                                <p class="text-purple-200">Machine Learning-powered risk assessment and optimization</p>
                            </div>
                            <button id="close-ml-analysis" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                ✕ Close
                            </button>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- ML Predictions -->
                            <div class="bg-gray-800 rounded-lg p-4">
                                <h3 class="text-lg font-bold text-purple-400 mb-4">🧠 ML Predictions</h3>
                                <div id="ml-predictions" class="space-y-3"></div>
                            </div>
                            
                            <!-- Optimized Strategies -->
                            <div class="bg-gray-800 rounded-lg p-4">
                                <h3 class="text-lg font-bold text-blue-400 mb-4">⚡ Optimized Strategies</h3>
                                <div id="optimized-strategies" class="space-y-3"></div>
                            </div>
                            
                            <!-- Risk Analysis -->
                            <div class="bg-gray-800 rounded-lg p-4">
                                <h3 class="text-lg font-bold text-red-400 mb-4">⚠️ Risk Analysis</h3>
                                <div id="risk-analysis" class="space-y-3"></div>
                            </div>
                        </div>
                        
                        <!-- Recommendations -->
                        <div class="mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                            <h3 class="text-lg font-bold text-green-400 mb-3">💡 AI Recommendations</h3>
                            <div id="ai-recommendations" class="space-y-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        document.getElementById('close-ml-analysis').addEventListener('click', () => {
            container.classList.add('hidden');
        });
        
        return container;
    }

    displayAnalysis(mlPrediction, optimizedStrategies, riskAnalysis) {
        // Display ML predictions
        const predictionsEl = document.getElementById('ml-predictions');
        predictionsEl.innerHTML = `
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">Predicted Energy:</span>
                    <span class="text-white">${mlPrediction.energy.toFixed(1)} MT</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Crater Size:</span>
                    <span class="text-white">${mlPrediction.craterSize.toFixed(1)} km</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Est. Casualties:</span>
                    <span class="text-white">${mlPrediction.casualties.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Confidence:</span>
                    <span class="text-green-400">${Math.round(mlPrediction.confidence * 100)}%</span>
                </div>
            </div>
        `;
        
        // Display optimized strategies
        const strategiesEl = document.getElementById('optimized-strategies');
        strategiesEl.innerHTML = optimizedStrategies.slice(0, 3).map(strategy => `
            <div class="bg-gray-700 rounded p-3">
                <div class="font-bold text-blue-300">${strategy.name}</div>
                <div class="text-xs text-gray-400 mt-1">Score: ${strategy.score.toFixed(2)}</div>
                <div class="text-xs mt-1">${strategy.recommendation}</div>
            </div>
        `).join('');
        
        // Display risk analysis
        const riskEl = document.getElementById('risk-analysis');
        riskEl.innerHTML = `
            <div class="space-y-2">
                <div class="text-center mb-3">
                    <div class="text-2xl font-bold text-red-400">${riskAnalysis.overall.level}</div>
                    <div class="text-xs text-gray-400">${riskAnalysis.overall.description}</div>
                </div>
                ${Object.entries(riskAnalysis.factors).map(([factor, data]) => `
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-400 capitalize">${factor}:</span>
                        <span class="text-${data.level === 'Low' ? 'green' : data.level === 'Moderate' ? 'yellow' : 'red'}-400">${data.level}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Display recommendations
        const recommendationsEl = document.getElementById('ai-recommendations');
        recommendationsEl.innerHTML = riskAnalysis.recommendations.map(rec => `
            <div class="text-sm text-green-200">${rec}</div>
        `).join('');
    }
}

// Simple Neural Network Implementation
class SimpleNeuralNetwork {
    constructor(layers) {
        this.layers = layers;
        this.weights = [];
        this.biases = [];
        
        // Initialize weights and biases
        for (let i = 0; i < layers.length - 1; i++) {
            const weightMatrix = [];
            const biasVector = [];
            
            for (let j = 0; j < layers[i + 1]; j++) {
                const neuronWeights = [];
                for (let k = 0; k < layers[i]; k++) {
                    neuronWeights.push(Math.random() * 2 - 1); // Random between -1 and 1
                }
                weightMatrix.push(neuronWeights);
                biasVector.push(Math.random() * 2 - 1);
            }
            
            this.weights.push(weightMatrix);
            this.biases.push(biasVector);
        }
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    sigmoidDerivative(x) {
        return x * (1 - x);
    }

    predict(inputs) {
        let activations = inputs;
        
        for (let i = 0; i < this.weights.length; i++) {
            const newActivations = [];
            
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                for (let k = 0; k < activations.length; k++) {
                    sum += activations[k] * this.weights[i][j][k];
                }
                newActivations.push(this.sigmoid(sum));
            }
            
            activations = newActivations;
        }
        
        return activations;
    }

    train(inputs, targets, learningRate) {
        // Forward pass
        const layerOutputs = [inputs];
        let activations = inputs;
        
        for (let i = 0; i < this.weights.length; i++) {
            const newActivations = [];
            
            for (let j = 0; j < this.weights[i].length; j++) {
                let sum = this.biases[i][j];
                for (let k = 0; k < activations.length; k++) {
                    sum += activations[k] * this.weights[i][j][k];
                }
                newActivations.push(this.sigmoid(sum));
            }
            
            activations = newActivations;
            layerOutputs.push(activations);
        }
        
        // Backward pass
        let errors = [];
        for (let i = 0; i < targets.length; i++) {
            errors.push(targets[i] - activations[i]);
        }
        
        for (let i = this.weights.length - 1; i >= 0; i--) {
            const newErrors = new Array(layerOutputs[i].length).fill(0);
            
            for (let j = 0; j < this.weights[i].length; j++) {
                const delta = errors[j] * this.sigmoidDerivative(layerOutputs[i + 1][j]);
                
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    newErrors[k] += delta * this.weights[i][j][k];
                    this.weights[i][j][k] += learningRate * delta * layerOutputs[i][k];
                }
                
                this.biases[i][j] += learningRate * delta;
            }
            
            errors = newErrors;
        }
    }
}

// Global instance
const mlImpactOptimizer = new MLImpactOptimizer();

// Initialize ML system
mlImpactOptimizer.initialize();

// Function to show ML analysis
function showMLAnalysis() {
    const asteroid = {
        diameter: state.diameter,
        velocity: state.velocity,
        density: state.density,
        angle: state.angle,
        warningTime: 365 // Default 1 year warning
    };
    
    mlImpactOptimizer.showMLAnalysis(asteroid, null);
}
