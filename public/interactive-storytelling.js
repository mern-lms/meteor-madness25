// ==================== Interactive Educational Storytelling ====================
// Guided narrative experiences for asteroid impact education

class InteractiveStorytellingSystem {
    constructor() {
        this.currentStory = null;
        this.currentChapter = 0;
        this.isActive = false;
        this.userChoices = [];
        
        this.stories = {
            'impactor2025': {
                title: "Impactor-2025: A Hypothetical Scenario",
                description: "Experience a realistic asteroid threat scenario and learn how scientists and policymakers would respond.",
                chapters: [
                    {
                        title: "Discovery",
                        content: "January 15, 2025 - The Catalina Sky Survey telescope in Arizona detects a new object...",
                        narration: "It's a routine night at the Catalina Sky Survey. Dr. Sarah Chen is reviewing the latest batch of images when she notices something unusual - a moving dot that wasn't there yesterday.",
                        choices: [
                            { text: "Investigate the object immediately", action: "investigate" },
                            { text: "Wait for confirmation from other observatories", action: "wait" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "Most asteroids are discovered by automated sky surveys that take thousands of images each night."
                    },
                    {
                        title: "Confirmation",
                        content: "Within 48 hours, observatories worldwide confirm the discovery...",
                        narration: "The object, now designated 2025 AA1, has been confirmed by multiple observatories. Initial calculations suggest it's approximately 150 meters in diameter - large enough to cause significant regional damage.",
                        choices: [
                            { text: "Calculate precise orbital trajectory", action: "calculate" },
                            { text: "Alert international space agencies", action: "alert" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "The Minor Planet Center coordinates asteroid discoveries and orbital calculations worldwide."
                    },
                    {
                        title: "The Threat Assessment",
                        content: "Orbital calculations reveal a concerning possibility...",
                        narration: "After 72 hours of observations, the orbital trajectory becomes clear. 2025 AA1 has a 1 in 50 chance of impacting Earth on March 15, 2027 - just over 2 years away. The potential impact zone includes major population centers in Europe.",
                        choices: [
                            { text: "Begin immediate deflection planning", action: "deflect" },
                            { text: "Continue observations to refine trajectory", action: "observe" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "Impact probability assessments improve dramatically with more observations over time."
                    },
                    {
                        title: "International Response",
                        content: "The United Nations Office for Outer Space Affairs convenes an emergency session...",
                        narration: "With a 2% impact probability, 2025 AA1 triggers international protocols. The UN Space Mission Planning Advisory Group (SMPAG) meets to coordinate a global response. Time is critical - deflection missions are most effective with years of lead time.",
                        choices: [
                            { text: "Launch kinetic impactor mission", action: "kinetic" },
                            { text: "Deploy gravity tractor", action: "gravity" },
                            { text: "Prepare nuclear deflection as backup", action: "nuclear" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "Real international protocols exist for planetary defense, coordinated through UN agencies."
                    },
                    {
                        title: "Mission Launch",
                        content: "Eighteen months before potential impact...",
                        narration: "The international community decides on a kinetic impactor mission, similar to NASA's successful DART mission. The spacecraft, built in record time through international cooperation, launches on a trajectory to intercept 2025 AA1 six months before its closest approach to Earth.",
                        choices: [
                            { text: "Monitor mission progress", action: "monitor" },
                            { text: "Prepare evacuation plans", action: "evacuate" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "Kinetic impactors work by transferring momentum to change an asteroid's velocity by just a few centimeters per second."
                    },
                    {
                        title: "Impact and Success",
                        content: "September 15, 2026 - The moment of truth...",
                        narration: "The kinetic impactor successfully strikes 2025 AA1, creating a spectacular flash visible from Earth-based telescopes. Over the following weeks, precise measurements confirm the deflection was successful. The asteroid will now miss Earth by over 100,000 kilometers - a comfortable margin.",
                        choices: [
                            { text: "Celebrate the success", action: "celebrate" },
                            { text: "Learn from the experience", action: "learn" }
                        ],
                        parameters: { diameter: 150, velocity: 25, density: 2700 },
                        educationalNote: "Small changes in velocity, applied years in advance, can result in huge changes in an asteroid's position when it reaches Earth's orbit."
                    }
                ]
            },
            'chicxulub': {
                title: "The Day the Dinosaurs Died",
                description: "Travel back 66 million years to experience the asteroid impact that changed Earth forever.",
                chapters: [
                    {
                        title: "A Normal Day in the Cretaceous",
                        content: "66 million years ago, Earth was a very different place...",
                        narration: "The late Cretaceous period was a time of incredible biodiversity. Massive dinosaurs roamed lush forests, while pterosaurs soared through warm, humid skies. The climate was tropical even at the poles, and sea levels were much higher than today.",
                        choices: [
                            { text: "Explore the Cretaceous ecosystem", action: "explore" },
                            { text: "Focus on the approaching threat", action: "threat" }
                        ],
                        parameters: { diameter: 10000, velocity: 30, density: 3000 },
                        educationalNote: "The Cretaceous period ended 66 million years ago with the fifth mass extinction event in Earth's history."
                    },
                    {
                        title: "The Asteroid Approaches",
                        content: "A 10-kilometer-wide asteroid hurtles toward Earth...",
                        narration: "High above Earth's atmosphere, a mountain-sized asteroid - larger than Mount Everest - approaches at 30 kilometers per second. This cosmic projectile has been traveling through space for millions of years, and its collision with Earth is about to reshape the planet's future.",
                        choices: [
                            { text: "Calculate the impact energy", action: "calculate" },
                            { text: "Witness the impact", action: "impact" }
                        ],
                        parameters: { diameter: 10000, velocity: 30, density: 3000 },
                        educationalNote: "The Chicxulub impactor released energy equivalent to billions of nuclear weapons."
                    },
                    {
                        title: "Impact!",
                        content: "The asteroid strikes the Yucatan Peninsula...",
                        narration: "The impact creates a crater 150 kilometers wide and 20 kilometers deep. The explosion is brighter than the Sun, vaporizing rock and creating a fireball that expands across the continent. Massive earthquakes shake the entire planet, and tsunamis hundreds of meters high race across the oceans.",
                        choices: [
                            { text: "Examine the immediate effects", action: "immediate" },
                            { text: "Look at global consequences", action: "global" }
                        ],
                        parameters: { diameter: 10000, velocity: 30, density: 3000 },
                        educationalNote: "The Chicxulub crater is still visible today, buried beneath the Yucatan Peninsula in Mexico."
                    },
                    {
                        title: "Nuclear Winter",
                        content: "Dust and debris block out the Sun...",
                        narration: "Trillions of tons of vaporized rock and debris are blasted into the atmosphere, creating a global dust cloud that blocks sunlight for months. Temperatures plummet worldwide, and photosynthesis nearly stops. This 'impact winter' devastates ecosystems across the planet.",
                        choices: [
                            { text: "Follow the extinction process", action: "extinction" },
                            { text: "See what survives", action: "survivors" }
                        ],
                        parameters: { diameter: 10000, velocity: 30, density: 3000 },
                        educationalNote: "The impact winter lasted for months to years, causing the collapse of food chains worldwide."
                    },
                    {
                        title: "The Great Dying",
                        content: "75% of all species go extinct...",
                        narration: "Over the following months and years, three-quarters of all species on Earth go extinct, including all non-avian dinosaurs. However, some creatures survive in burrows, underwater, or by eating seeds and detritus. These survivors will eventually give rise to the mammals that dominate today's world.",
                        choices: [
                            { text: "Explore the aftermath", action: "aftermath" },
                            { text: "Jump to modern times", action: "modern" }
                        ],
                        parameters: { diameter: 10000, velocity: 30, density: 3000 },
                        educationalNote: "The extinction opened ecological niches that allowed mammals to diversify and eventually evolve into humans."
                    }
                ]
            },
            'tunguska': {
                title: "The Tunguska Mystery",
                description: "Investigate the 1908 Siberian explosion that flattened 2,000 square kilometers of forest.",
                chapters: [
                    {
                        title: "A Remote Morning in Siberia",
                        content: "June 30, 1908 - A quiet morning in the Siberian wilderness...",
                        narration: "In the remote Tunguska region of Siberia, indigenous Evenk people are going about their morning routines when suddenly, the sky explodes in brilliant light. A fireball brighter than the Sun streaks across the sky, followed by a thunderous explosion that can be heard 1,000 kilometers away.",
                        choices: [
                            { text: "Investigate the explosion", action: "investigate" },
                            { text: "Interview witnesses", action: "witnesses" }
                        ],
                        parameters: { diameter: 60, velocity: 15, density: 2000 },
                        educationalNote: "The Tunguska event was the largest impact event in recorded human history."
                    },
                    {
                        title: "The Devastation",
                        content: "An area larger than London is completely flattened...",
                        narration: "The explosion flattens 80 million trees across 2,150 square kilometers. The blast is so powerful that it registers on seismographs across Europe and creates atmospheric pressure waves that circle the globe twice. Yet mysteriously, no crater is found.",
                        choices: [
                            { text: "Search for the crater", action: "crater" },
                            { text: "Study the tree patterns", action: "trees" }
                        ],
                        parameters: { diameter: 60, velocity: 15, density: 2000 },
                        educationalNote: "The lack of a crater suggests the object exploded in the air, creating an airburst."
                    },
                    {
                        title: "Scientific Investigation",
                        content: "Decades later, scientists finally reach the remote site...",
                        narration: "It takes until 1927 for the first scientific expedition to reach the Tunguska site. Led by Soviet scientist Leonid Kulik, the team expects to find a massive crater and meteorite fragments. Instead, they discover a pattern of fallen trees radiating outward from a central point - evidence of an aerial explosion.",
                        choices: [
                            { text: "Analyze the evidence", action: "analyze" },
                            { text: "Propose theories", action: "theories" }
                        ],
                        parameters: { diameter: 60, velocity: 15, density: 2000 },
                        educationalNote: "The radial pattern of fallen trees provided crucial evidence about the nature of the explosion."
                    }
                ]
            }
        };
    }

    startStory(storyId) {
        this.currentStory = this.stories[storyId];
        this.currentChapter = 0;
        this.isActive = true;
        this.userChoices = [];
        
        this.showStoryInterface();
        this.displayChapter();
    }

    showStoryInterface() {
        const storyContainer = this.createStoryContainer();
        storyContainer.classList.remove('hidden');
    }

    createStoryContainer() {
        let container = document.getElementById('story-container');
        if (container) return container;
        
        container = document.createElement('div');
        container.id = 'story-container';
        container.className = 'fixed inset-0 bg-black/95 z-50 hidden overflow-y-auto';
        container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="max-w-4xl w-full bg-gray-900 rounded-xl border border-blue-500/30 overflow-hidden">
                    <!-- Story Header -->
                    <div class="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <h1 id="story-title" class="text-2xl font-bold text-white orbitron mb-2"></h1>
                                <p id="story-description" class="text-blue-200"></p>
                            </div>
                            <button id="close-story" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                ✕ Exit Story
                            </button>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="mt-4">
                            <div class="flex justify-between text-sm text-blue-200 mb-2">
                                <span>Progress</span>
                                <span id="chapter-progress">Chapter 1 of 6</span>
                            </div>
                            <div class="w-full bg-blue-900/50 rounded-full h-2">
                                <div id="progress-bar" class="bg-blue-400 h-2 rounded-full transition-all duration-500" style="width: 16.67%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Story Content -->
                    <div class="p-6">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Narrative Panel -->
                            <div class="space-y-4">
                                <h2 id="chapter-title" class="text-xl font-bold text-blue-400 orbitron"></h2>
                                <div id="chapter-content" class="text-gray-300 leading-relaxed"></div>
                                <div id="chapter-narration" class="bg-blue-900/20 border-l-4 border-blue-400 p-4 italic text-blue-100"></div>
                                
                                <!-- Educational Note -->
                                <div id="educational-note" class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                    <div class="flex items-start space-x-2">
                                        <div class="text-green-400 mt-1">💡</div>
                                        <div>
                                            <div class="text-green-400 font-bold text-sm mb-1">Did You Know?</div>
                                            <div id="educational-text" class="text-green-100 text-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Interactive Panel -->
                            <div class="space-y-4">
                                <!-- Simulation Parameters -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-bold mb-3">Current Scenario Parameters</h3>
                                    <div id="scenario-params" class="space-y-2 text-sm"></div>
                                </div>
                                
                                <!-- Choices -->
                                <div class="bg-gray-800 rounded-lg p-4">
                                    <h3 class="text-white font-bold mb-3">What would you do?</h3>
                                    <div id="story-choices" class="space-y-2"></div>
                                </div>
                                
                                <!-- Navigation -->
                                <div class="flex justify-between">
                                    <button id="prev-chapter" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50" disabled>
                                        ← Previous
                                    </button>
                                    <button id="next-chapter" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Event listeners
        document.getElementById('close-story').addEventListener('click', () => {
            this.endStory();
        });
        
        document.getElementById('prev-chapter').addEventListener('click', () => {
            this.previousChapter();
        });
        
        document.getElementById('next-chapter').addEventListener('click', () => {
            this.nextChapter();
        });
        
        return container;
    }

    displayChapter() {
        const chapter = this.currentStory.chapters[this.currentChapter];
        
        // Update header
        document.getElementById('story-title').textContent = this.currentStory.title;
        document.getElementById('story-description').textContent = this.currentStory.description;
        
        // Update progress
        const progress = ((this.currentChapter + 1) / this.currentStory.chapters.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('chapter-progress').textContent = 
            `Chapter ${this.currentChapter + 1} of ${this.currentStory.chapters.length}`;
        
        // Update content
        document.getElementById('chapter-title').textContent = chapter.title;
        document.getElementById('chapter-content').textContent = chapter.content;
        document.getElementById('chapter-narration').textContent = chapter.narration;
        document.getElementById('educational-text').textContent = chapter.educationalNote;
        
        // Update parameters
        this.updateScenarioParameters(chapter.parameters);
        
        // Update choices
        this.displayChoices(chapter.choices);
        
        // Update navigation
        document.getElementById('prev-chapter').disabled = this.currentChapter === 0;
        document.getElementById('next-chapter').textContent = 
            this.currentChapter === this.currentStory.chapters.length - 1 ? 'Finish Story' : 'Next →';
        
        // Apply parameters to main simulator
        if (chapter.parameters) {
            state.diameter = chapter.parameters.diameter;
            state.velocity = chapter.parameters.velocity;
            state.density = chapter.parameters.density;
            updateSliderValues();
        }
    }

    updateScenarioParameters(params) {
        const paramsContainer = document.getElementById('scenario-params');
        paramsContainer.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-400">Diameter:</span>
                <span class="text-white">${params.diameter.toLocaleString()} m</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">Velocity:</span>
                <span class="text-white">${params.velocity} km/s</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400">Density:</span>
                <span class="text-white">${params.density.toLocaleString()} kg/m³</span>
            </div>
        `;
    }

    displayChoices(choices) {
        const choicesContainer = document.getElementById('story-choices');
        choicesContainer.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'w-full text-left bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 rounded-lg p-3 transition';
            button.innerHTML = `
                <div class="text-blue-200">${choice.text}</div>
            `;
            
            button.addEventListener('click', () => {
                this.makeChoice(choice, index);
            });
            
            choicesContainer.appendChild(button);
        });
    }

    makeChoice(choice, index) {
        this.userChoices.push({
            chapter: this.currentChapter,
            choice: choice,
            index: index
        });
        
        // Highlight selected choice
        const buttons = document.querySelectorAll('#story-choices button');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('bg-green-900/50', 'border-green-500/50');
                btn.classList.remove('bg-blue-900/30', 'border-blue-500/30');
            } else {
                btn.classList.add('opacity-50');
            }
        });
        
        // Show choice feedback
        this.showChoiceFeedback(choice);
    }

    showChoiceFeedback(choice) {
        const feedback = document.createElement('div');
        feedback.className = 'mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3 animate-fade-in';
        feedback.innerHTML = `
            <div class="text-green-400 font-bold text-sm mb-1">Your Choice:</div>
            <div class="text-green-100 text-sm">${choice.text}</div>
            <div class="text-green-200 text-xs mt-2 italic">This choice will influence how the story unfolds...</div>
        `;
        
        document.getElementById('story-choices').appendChild(feedback);
    }

    nextChapter() {
        if (this.currentChapter < this.currentStory.chapters.length - 1) {
            this.currentChapter++;
            this.displayChapter();
        } else {
            this.finishStory();
        }
    }

    previousChapter() {
        if (this.currentChapter > 0) {
            this.currentChapter--;
            this.displayChapter();
        }
    }

    finishStory() {
        this.showStoryCompletion();
    }

    showStoryCompletion() {
        const completionScreen = document.createElement('div');
        completionScreen.className = 'fixed inset-0 bg-black/95 z-60 flex items-center justify-center p-4';
        completionScreen.innerHTML = `
            <div class="max-w-2xl bg-gradient-to-br from-green-900 to-blue-900 rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold text-white mb-4 orbitron">Story Complete!</h2>
                <p class="text-green-200 mb-6">You've successfully navigated through "${this.currentStory.title}"</p>
                
                <div class="bg-black/30 rounded-lg p-4 mb-6">
                    <h3 class="text-white font-bold mb-2">Your Journey:</h3>
                    <div class="text-sm text-gray-300">
                        You made ${this.userChoices.length} key decisions throughout this story.
                        Each choice reflects real considerations that scientists and policymakers face
                        when dealing with asteroid threats.
                    </div>
                </div>
                
                <div class="space-y-3">
                    <button id="try-another-story" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold">
                        📚 Try Another Story
                    </button>
                    <button id="return-to-simulator" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
                        🔬 Return to Simulator
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(completionScreen);
        
        document.getElementById('try-another-story').addEventListener('click', () => {
            completionScreen.remove();
            this.showStorySelection();
        });
        
        document.getElementById('return-to-simulator').addEventListener('click', () => {
            completionScreen.remove();
            this.endStory();
        });
    }

    showStorySelection() {
        const selectionScreen = document.createElement('div');
        selectionScreen.className = 'fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4';
        selectionScreen.innerHTML = `
            <div class="max-w-4xl mx-auto py-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-white orbitron mb-4">📖 Interactive Stories</h1>
                    <p class="text-gray-300">Choose your educational adventure</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${Object.entries(this.stories).map(([id, story]) => `
                        <div class="bg-gray-900 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition cursor-pointer story-card" data-story="${id}">
                            <h3 class="text-xl font-bold text-blue-400 mb-3 orbitron">${story.title}</h3>
                            <p class="text-gray-300 text-sm mb-4">${story.description}</p>
                            <div class="text-xs text-gray-400">
                                ${story.chapters.length} chapters • Interactive experience
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="text-center mt-8">
                    <button id="close-story-selection" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg">
                        ← Back to Simulator
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectionScreen);
        
        // Event listeners
        document.querySelectorAll('.story-card').forEach(card => {
            card.addEventListener('click', () => {
                const storyId = card.dataset.story;
                selectionScreen.remove();
                this.startStory(storyId);
            });
        });
        
        document.getElementById('close-story-selection').addEventListener('click', () => {
            selectionScreen.remove();
        });
    }

    endStory() {
        this.isActive = false;
        this.currentStory = null;
        this.currentChapter = 0;
        this.userChoices = [];
        
        const container = document.getElementById('story-container');
        if (container) {
            container.classList.add('hidden');
        }
    }
}

// Global instance
const interactiveStorytellingSystem = new InteractiveStorytellingSystem();

// Function to show story selection
function showInteractiveStories() {
    interactiveStorytellingSystem.showStorySelection();
}
