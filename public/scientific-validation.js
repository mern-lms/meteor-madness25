// ==================== Scientific Accuracy Validation System ====================
// Real-time validation and educational feedback for scientific accuracy

class ScientificValidationSystem {
    constructor() {
        this.validationRules = new Map();
        this.warningThresholds = new Map();
        this.educationalFeedback = new Map();
        this.isInitialized = false;
        
        this.initializeValidationRules();
    }

    initializeValidationRules() {
        // Validation rules for asteroid parameters
        this.validationRules.set('diameter', {
            min: 1,
            max: 50000,
            realistic: { min: 10, max: 10000 },
            warning: (value) => {
                if (value < 10) return { level: 'info', message: 'Small asteroids typically burn up in atmosphere' };
                if (value > 1000) return { level: 'warning', message: 'Asteroids this large are extremely rare' };
                if (value > 10000) return { level: 'error', message: 'Larger than the asteroid that killed dinosaurs!' };
                return null;
            }
        });

        this.validationRules.set('velocity', {
            min: 11,
            max: 72,
            realistic: { min: 15, max: 35 },
            warning: (value) => {
                if (value < 11) return { level: 'error', message: 'Below Earth escape velocity - impossible impact' };
                if (value < 15) return { level: 'warning', message: 'Very slow for asteroid impact' };
                if (value > 50) return { level: 'warning', message: 'Extremely high velocity - likely comet' };
                if (value > 72) return { level: 'error', message: 'Exceeds maximum observed velocity in solar system' };
                return null;
            }
        });

        this.validationRules.set('density', {
            min: 500,
            max: 8000,
            realistic: { min: 1000, max: 5000 },
            warning: (value) => {
                if (value < 1000) return { level: 'info', message: 'Very low density - likely icy or porous' };
                if (value > 5000) return { level: 'info', message: 'High density - likely metallic asteroid' };
                if (value > 8000) return { level: 'warning', message: 'Density higher than iron - unrealistic' };
                return null;
            }
        });

        // Educational feedback for combinations
        this.educationalFeedback.set('high-velocity-small', {
            condition: (params) => params.velocity > 40 && params.diameter < 50,
            message: '🌟 High-velocity small objects are often comets or interstellar visitors like Oumuamua!',
            type: 'insight'
        });

        this.educationalFeedback.set('large-slow', {
            condition: (params) => params.diameter > 500 && params.velocity < 20,
            message: '🪨 Large, slow asteroids typically come from the main asteroid belt.',
            type: 'insight'
        });
    }

    validateParameters(params) {
        const results = {
            isValid: true,
            warnings: [],
            insights: [],
            recommendations: []
        };

        // Validate individual parameters
        Object.entries(params).forEach(([key, value]) => {
            const rule = this.validationRules.get(key);
            if (rule) {
                // Check bounds
                if (value < rule.min || value > rule.max) {
                    results.isValid = false;
                    results.warnings.push({
                        parameter: key,
                        level: 'error',
                        message: `${key} must be between ${rule.min} and ${rule.max}`
                    });
                }

                // Check warnings
                const warning = rule.warning(value);
                if (warning) {
                    results.warnings.push({
                        parameter: key,
                        ...warning
                    });
                }
            }
        });

        // Check parameter combinations for insights
        this.educationalFeedback.forEach((feedback, key) => {
            if (feedback.condition(params)) {
                results.insights.push({
                    key: key,
                    message: feedback.message,
                    type: feedback.type
                });
            }
        });

        // Generate recommendations
        results.recommendations = this.generateRecommendations(params, results);

        return results;
    }

    generateRecommendations(params, validationResults) {
        const recommendations = [];

        // Energy-based recommendations
        const energy = this.calculateEnergy(params);
        if (energy < 0.1) {
            recommendations.push({
                type: 'suggestion',
                message: '💡 Try increasing size or velocity to see more dramatic effects',
                action: 'increase-parameters'
            });
        } else if (energy > 100000) {
            recommendations.push({
                type: 'caution',
                message: '⚠️ This scenario represents a civilization-ending event',
                action: 'show-historical-context'
            });
        }

        // Deflection recommendations
        if (params.diameter > 100) {
            recommendations.push({
                type: 'deflection',
                message: '🛡️ Objects this size require years of advance warning for deflection',
                action: 'show-deflection-strategies'
            });
        }

        return recommendations;
    }

    calculateEnergy(params) {
        const mass = (4/3) * Math.PI * Math.pow(params.diameter/2, 3) * params.density;
        const energy = 0.5 * mass * Math.pow(params.velocity * 1000, 2);
        return energy / (4.184e15); // Convert to megatons TNT
    }

    showValidationPanel(validationResults) {
        this.hideValidationPanel();

        const panel = document.createElement('div');
        panel.id = 'validation-panel';
        panel.className = 'fixed bottom-4 right-4 bg-gray-900 border border-blue-500/30 rounded-lg p-4 max-w-sm z-40';
        
        let content = '<h3 class="font-bold text-blue-400 mb-3">🔬 Scientific Validation</h3>';

        // Show warnings
        if (validationResults.warnings.length > 0) {
            content += '<div class="space-y-2 mb-3">';
            validationResults.warnings.forEach(warning => {
                const color = warning.level === 'error' ? 'red' : warning.level === 'warning' ? 'yellow' : 'blue';
                content += `
                    <div class="text-${color}-400 text-sm flex items-start space-x-2">
                        <span class="flex-shrink-0">${warning.level === 'error' ? '❌' : warning.level === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <span>${warning.message}</span>
                    </div>
                `;
            });
            content += '</div>';
        }

        // Show insights
        if (validationResults.insights.length > 0) {
            content += '<div class="space-y-2 mb-3">';
            validationResults.insights.forEach(insight => {
                content += `
                    <div class="text-green-400 text-sm flex items-start space-x-2">
                        <span class="flex-shrink-0">💡</span>
                        <span>${insight.message}</span>
                    </div>
                `;
            });
            content += '</div>';
        }

        // Show recommendations
        if (validationResults.recommendations.length > 0) {
            content += '<div class="space-y-2">';
            validationResults.recommendations.forEach(rec => {
                const color = rec.type === 'caution' ? 'yellow' : 'blue';
                content += `
                    <div class="text-${color}-300 text-sm flex items-start space-x-2">
                        <span class="flex-shrink-0">${rec.type === 'caution' ? '⚠️' : '💡'}</span>
                        <span>${rec.message}</span>
                    </div>
                `;
            });
            content += '</div>';
        }

        // Add close button
        content += `
            <button id="close-validation" class="absolute top-2 right-2 text-gray-400 hover:text-white text-sm">✕</button>
        `;

        panel.innerHTML = content;
        document.body.appendChild(panel);

        // Add event listener for close button
        document.getElementById('close-validation').addEventListener('click', () => {
            this.hideValidationPanel();
        });

        // Auto-hide after 10 seconds if no errors
        if (validationResults.warnings.every(w => w.level !== 'error')) {
            setTimeout(() => {
                this.hideValidationPanel();
            }, 10000);
        }
    }

    hideValidationPanel() {
        const panel = document.getElementById('validation-panel');
        if (panel) {
            panel.remove();
        }
    }

    addRealTimeValidation() {
        // Add validation to slider changes
        const sliders = ['diameter-slider', 'velocity-slider', 'density-slider', 'angle-slider'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', () => {
                    this.validateCurrentParameters();
                });
            }
        });
    }

    validateCurrentParameters() {
        const params = {
            diameter: state.diameter,
            velocity: state.velocity,
            density: state.density,
            angle: state.angle
        };

        const validationResults = this.validateParameters(params);
        
        // Only show panel if there are warnings or insights
        if (validationResults.warnings.length > 0 || validationResults.insights.length > 0) {
            this.showValidationPanel(validationResults);
        } else {
            this.hideValidationPanel();
        }
    }

    showScientificAccuracyGuide() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-xl border border-green-500/30 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-900 to-blue-900 p-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-white">🔬 Scientific Accuracy Guide</h2>
                        <button id="close-accuracy-guide" class="text-gray-400 hover:text-white">✕</button>
                    </div>
                </div>
                <div class="p-6 space-y-6">
                    ${this.renderAccuracyGuide()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('#close-accuracy-guide').addEventListener('click', () => {
            modal.remove();
        });
    }

    renderAccuracyGuide() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="font-bold text-blue-400 mb-3">📏 Realistic Size Ranges</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Meteoroids:</span>
                            <span class="text-gray-300">1mm - 1m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Small asteroids:</span>
                            <span class="text-gray-300">1m - 100m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Large asteroids:</span>
                            <span class="text-gray-300">100m - 10km</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Chicxulub impactor:</span>
                            <span class="text-yellow-400">~10km</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="font-bold text-green-400 mb-3">⚡ Velocity Ranges</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Earth escape velocity:</span>
                            <span class="text-gray-300">11.2 km/s</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Typical asteroids:</span>
                            <span class="text-gray-300">15-25 km/s</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Fast asteroids:</span>
                            <span class="text-gray-300">25-40 km/s</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Comets (max):</span>
                            <span class="text-yellow-400">~72 km/s</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="font-bold text-purple-400 mb-3">🪨 Density Types</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>C-type (carbonaceous):</span>
                            <span class="text-gray-300">1000-2000 kg/m³</span>
                        </div>
                        <div class="flex justify-between">
                            <span>S-type (silicate):</span>
                            <span class="text-gray-300">2000-3500 kg/m³</span>
                        </div>
                        <div class="flex justify-between">
                            <span>M-type (metallic):</span>
                            <span class="text-gray-300">3500-8000 kg/m³</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Iron meteorites:</span>
                            <span class="text-yellow-400">~7800 kg/m³</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="font-bold text-red-400 mb-3">💥 Historical Events</h3>
                    <div class="space-y-2 text-sm">
                        <div>
                            <div class="font-medium">Chelyabinsk (2013)</div>
                            <div class="text-gray-400">20m, 19 km/s, airburst</div>
                        </div>
                        <div>
                            <div class="font-medium">Tunguska (1908)</div>
                            <div class="text-gray-400">60m, 15 km/s, airburst</div>
                        </div>
                        <div>
                            <div class="font-medium">Chicxulub (66 Mya)</div>
                            <div class="text-gray-400">10km, 30 km/s, impact</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 class="font-bold text-blue-400 mb-3">🎯 Accuracy Features</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 class="font-medium text-blue-300 mb-2">Real-time Validation:</h4>
                        <ul class="space-y-1 text-gray-300">
                            <li>• Parameter range checking</li>
                            <li>• Physics-based warnings</li>
                            <li>• Realistic scenario detection</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-medium text-green-300 mb-2">Educational Insights:</h4>
                        <ul class="space-y-1 text-gray-300">
                            <li>• Contextual explanations</li>
                            <li>• Historical comparisons</li>
                            <li>• Scientific recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    initialize() {
        if (this.isInitialized) return;
        
        // Add real-time validation to sliders
        setTimeout(() => {
            this.addRealTimeValidation();
        }, 1000);
        
        this.isInitialized = true;
        console.log('🔬 Scientific Validation System initialized');
    }
}

// Global instance
const scientificValidationSystem = new ScientificValidationSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        scientificValidationSystem.initialize();
    });
} else {
    scientificValidationSystem.initialize();
}

// Global function to show accuracy guide
function showScientificAccuracyGuide() {
    scientificValidationSystem.showScientificAccuracyGuide();
}
