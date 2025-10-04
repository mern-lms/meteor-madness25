// ==================== Educational Enhancements ====================
// Advanced tooltips, infographics, and interactive learning features

class EducationalEnhancementSystem {
    constructor() {
        this.tooltips = new Map();
        this.infographics = new Map();
        this.conceptExplainers = new Map();
        this.isInitialized = false;
        this.currentTooltip = null;
        
        this.initializeEducationalContent();
    }

    initializeEducationalContent() {
        // Advanced tooltips with interactive content
        this.tooltips.set('diameter', {
            title: 'Asteroid Diameter',
            content: `
                <div class="space-y-3">
                    <p>The size of an asteroid dramatically affects its impact potential.</p>
                    <div class="bg-gray-800 p-3 rounded">
                        <h4 class="font-bold text-blue-400 mb-2">Size Classifications:</h4>
                        <div class="text-sm space-y-1">
                            <div>🏠 <10m: Burns up in atmosphere</div>
                            <div>🏢 10-50m: Local damage (Chelyabinsk)</div>
                            <div>🏙️ 50-200m: City destroyer (Tunguska)</div>
                            <div>🌍 200m+: Regional/Global effects</div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400">
                        💡 A 10x increase in diameter = 1000x increase in mass!
                    </div>
                </div>
            `,
            interactive: true,
            relatedConcepts: ['mass', 'energy', 'crater-scaling']
        });

        this.tooltips.set('velocity', {
            title: 'Impact Velocity',
            content: `
                <div class="space-y-3">
                    <p>Asteroid velocity determines the kinetic energy of impact.</p>
                    <div class="bg-gray-800 p-3 rounded">
                        <h4 class="font-bold text-green-400 mb-2">Velocity Sources:</h4>
                        <div class="text-sm space-y-1">
                            <div>🌍 Earth's gravity: +11 km/s minimum</div>
                            <div>🌞 Solar orbit: 15-30 km/s typical</div>
                            <div>☄️ Comets: Up to 72 km/s maximum</div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400">
                        ⚡ Energy increases with velocity squared (v²)!
                    </div>
                </div>
            `,
            interactive: true,
            relatedConcepts: ['kinetic-energy', 'orbital-mechanics']
        });

        // Interactive infographics
        this.infographics.set('impact-timeline', {
            title: 'Asteroid Impact Timeline',
            type: 'timeline',
            data: [
                { time: 'T-10 seconds', event: 'Asteroid enters atmosphere', description: 'Begins heating and glowing' },
                { time: 'T-5 seconds', event: 'Atmospheric compression', description: 'Shockwave forms ahead of asteroid' },
                { time: 'T-0 seconds', event: 'IMPACT!', description: 'Kinetic energy released instantly' },
                { time: 'T+0.1 seconds', event: 'Crater formation begins', description: 'Rock vaporizes and excavates' },
                { time: 'T+1 second', event: 'Fireball expansion', description: 'Superheated gases expand outward' },
                { time: 'T+10 seconds', event: 'Shockwave propagation', description: 'Blast wave travels through ground and air' }
            ]
        });

        this.conceptExplainers.set('crater-scaling', {
            title: 'How Crater Size is Calculated',
            type: 'interactive-demo',
            formula: 'D = 1.8 × (ρₐ/ρₜ)^(1/3) × L^0.13 × v^0.44 × sin(θ)^(1/3) × g^(-0.22)',
            variables: {
                'D': 'Crater diameter (km)',
                'ρₐ': 'Asteroid density (kg/m³)',
                'ρₜ': 'Target rock density (kg/m³)',
                'L': 'Asteroid diameter (m)',
                'v': 'Impact velocity (km/s)',
                'θ': 'Impact angle (degrees)',
                'g': 'Surface gravity (m/s²)'
            }
        });
    }

    showAdvancedTooltip(element, tooltipKey) {
        const tooltip = this.tooltips.get(tooltipKey);
        if (!tooltip) return;

        this.hideCurrentTooltip();

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'advanced-tooltip fixed z-50 bg-gray-900 border border-blue-500/50 rounded-lg p-4 max-w-sm shadow-xl';
        tooltipEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-blue-400">${tooltip.title}</h3>
                <button class="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            <div class="tooltip-content">${tooltip.content}</div>
            ${tooltip.relatedConcepts ? `
                <div class="mt-3 pt-3 border-t border-gray-700">
                    <div class="text-xs text-gray-400 mb-2">Related concepts:</div>
                    <div class="flex flex-wrap gap-1">
                        ${tooltip.relatedConcepts.map(concept => 
                            `<button class="related-concept-btn text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-600/40" data-concept="${concept}">${concept}</button>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        document.body.appendChild(tooltipEl);
        this.positionTooltip(tooltipEl, element);
        this.currentTooltip = tooltipEl;

        // Add event listeners
        tooltipEl.querySelector('button').addEventListener('click', () => {
            this.hideCurrentTooltip();
        });

        tooltipEl.querySelectorAll('.related-concept-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showConceptExplainer(btn.dataset.concept);
            });
        });
    }

    positionTooltip(tooltipEl, targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        let top = rect.bottom + 10;
        let left = rect.left;

        // Adjust if tooltip would go off screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
    }

    hideCurrentTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    showConceptExplainer(conceptKey) {
        const concept = this.conceptExplainers.get(conceptKey);
        if (!concept) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-xl border border-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-white">${concept.title}</h2>
                        <button id="close-concept" class="text-gray-400 hover:text-white">✕</button>
                    </div>
                </div>
                <div class="p-6">
                    ${this.renderConceptContent(concept)}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('#close-concept').addEventListener('click', () => {
            modal.remove();
        });
    }

    renderConceptContent(concept) {
        if (concept.type === 'interactive-demo') {
            return `
                <div class="space-y-4">
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h3 class="font-bold text-green-400 mb-3">Formula:</h3>
                        <div class="font-mono text-sm bg-black/50 p-3 rounded text-center">
                            ${concept.formula}
                        </div>
                    </div>
                    
                    <div class="bg-gray-800 p-4 rounded-lg">
                        <h3 class="font-bold text-blue-400 mb-3">Variables:</h3>
                        <div class="space-y-2">
                            ${Object.entries(concept.variables).map(([variable, description]) => `
                                <div class="flex justify-between text-sm">
                                    <span class="font-mono text-yellow-400">${variable}</span>
                                    <span class="text-gray-300">${description}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                        <h4 class="font-bold text-blue-400 mb-2">💡 Key Insights:</h4>
                        <ul class="text-sm space-y-1 text-gray-300">
                            <li>• Crater size increases with asteroid size (L^0.13)</li>
                            <li>• Velocity has moderate effect (v^0.44)</li>
                            <li>• Vertical impacts (90°) create largest craters</li>
                            <li>• Denser asteroids create bigger craters</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        return '<p>Concept content not available.</p>';
    }

    showInteractiveInfographic(key) {
        const infographic = this.infographics.get(key);
        if (!infographic) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-xl border border-green-500/30 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-green-900 to-blue-900 p-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-white">${infographic.title}</h2>
                        <button id="close-infographic" class="text-gray-400 hover:text-white">✕</button>
                    </div>
                </div>
                <div class="p-6">
                    ${this.renderInfographic(infographic)}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('#close-infographic').addEventListener('click', () => {
            modal.remove();
        });

        // Animate timeline if it's a timeline infographic
        if (infographic.type === 'timeline') {
            this.animateTimeline(modal);
        }
    }

    renderInfographic(infographic) {
        if (infographic.type === 'timeline') {
            return `
                <div class="relative">
                    <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 to-orange-500"></div>
                    <div class="space-y-6">
                        ${infographic.data.map((item, index) => `
                            <div class="timeline-item flex items-start space-x-4 opacity-0 transform translate-x-4" style="animation-delay: ${index * 0.5}s">
                                <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    ${item.time}
                                </div>
                                <div class="flex-1 bg-gray-800 rounded-lg p-4">
                                    <h3 class="font-bold text-yellow-400 mb-2">${item.event}</h3>
                                    <p class="text-gray-300 text-sm">${item.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return '<p>Infographic not available.</p>';
    }

    animateTimeline(container) {
        const items = container.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInLeft 0.6s ease-out forwards';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 500);
        });
    }

    addSmartTooltips() {
        // Add tooltips to existing elements
        const elements = [
            { selector: '#diameter-slider', key: 'diameter' },
            { selector: '#velocity-slider', key: 'velocity' },
            { selector: '#density-slider', key: 'density' },
            { selector: '#angle-slider', key: 'angle' }
        ];

        elements.forEach(({ selector, key }) => {
            const element = document.querySelector(selector);
            if (element) {
                const container = element.closest('.space-y-4') || element.parentElement;
                const label = container.querySelector('label') || container.querySelector('.font-medium');
                
                if (label) {
                    // Add info icon
                    const infoIcon = document.createElement('button');
                    infoIcon.className = 'ml-2 text-blue-400 hover:text-blue-300 text-sm';
                    infoIcon.innerHTML = '💡';
                    infoIcon.title = 'Learn more';
                    
                    label.appendChild(infoIcon);
                    
                    infoIcon.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showAdvancedTooltip(infoIcon, key);
                    });
                }
            }
        });
    }

    addInfographicButtons() {
        // Add infographic buttons to relevant sections
        const impactSection = document.querySelector('#impact-results');
        if (impactSection) {
            const button = document.createElement('button');
            button.className = 'mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2';
            button.innerHTML = '<span>📊</span><span>Impact Timeline</span>';
            
            button.addEventListener('click', () => {
                this.showInteractiveInfographic('impact-timeline');
            });
            
            impactSection.appendChild(button);
        }
    }

    initialize() {
        if (this.isInitialized) return;
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .advanced-tooltip {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .timeline-item {
                transition: all 0.6s ease-out;
            }
        `;
        document.head.appendChild(style);
        
        // Add smart tooltips and infographic buttons
        setTimeout(() => {
            this.addSmartTooltips();
            this.addInfographicButtons();
        }, 1000);
        
        this.isInitialized = true;
        console.log('📚 Educational Enhancement System initialized');
    }
}

// Global instance
const educationalEnhancementSystem = new EducationalEnhancementSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        educationalEnhancementSystem.initialize();
    });
} else {
    educationalEnhancementSystem.initialize();
}
