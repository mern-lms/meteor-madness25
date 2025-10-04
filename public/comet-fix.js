// Fixed loadCometData function using NASA API
async function loadCometData() {
    const container = document.getElementById('comet-data');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-white mt-2">Loading NASA comet data...</p></div>';
    
    try {
        console.log('Loading Near-Earth Comets from NASA JPL API...');
        const response = await fetch('https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name,e,i,q,per_y&sb-class=COM&limit=200');
        
        if (response.ok) {
            const data = await response.json();
            console.log('NASA API response:', data);
            
            if (data.data && Array.isArray(data.data)) {
                const comets = data.data.map(row => ({
                    object_name: row[0] || 'Unknown',
                    e: parseFloat(row[1]) || null,
                    i_deg: parseFloat(row[2]) || null,
                    q_au_1: parseFloat(row[3]) || null,
                    p_yr: parseFloat(row[4]) || null
                }));
                
                container.innerHTML = `
                    <div class="mb-3 p-3 bg-black border border-white rounded-lg">
                        <h4 class="font-semibold text-white">Near-Earth Comets</h4>
                        <p class="text-sm text-white">${comets.length} comets loaded</p>
                        <p class="text-xs text-white">NASA JPL Small-Body Database</p>
                    </div>
                    
                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        ${comets.map(comet => `
                            <div class="p-2 bg-black border border-white rounded">
                                <div class="flex justify-between items-start">
                                    <span class="font-semibold text-sm text-white">${comet.object_name}</span>
                                    <span class="text-xs text-white">e=${comet.e?.toFixed(3) || 'N/A'}</span>
                                </div>
                                <div class="text-xs text-white mt-1">
                                    <span>i: ${comet.i_deg?.toFixed(1) || 'N/A'}°</span>
                                    <span class="ml-2">q: ${comet.q_au_1?.toFixed(3) || 'N/A'} AU</span>
                                    ${comet.p_yr ? `<span class="ml-2">P: ${comet.p_yr.toFixed(1)} yr</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mt-3 p-2 bg-black border border-white rounded text-xs text-white">
                        <p>Showing all ${comets.length} comets</p>
                        <p>e=eccentricity, i=inclination, q=perihelion, P=period</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }
        }
        throw new Error('NASA API request failed');
    } catch (error) {
        console.error('NASA API failed:', error);
        
        // Fallback to demo data
        const demoComets = [
            { object_name: "1P/Halley", e: 0.967, i_deg: 162.3, q_au_1: 0.586, p_yr: 75.3 },
            { object_name: "2P/Encke", e: 0.848, i_deg: 11.8, q_au_1: 0.336, p_yr: 3.3 },
            { object_name: "55P/Tempel-Tuttle", e: 0.906, i_deg: 162.5, q_au_1: 0.982, p_yr: 33.2 },
            { object_name: "109P/Swift-Tuttle", e: 0.963, i_deg: 113.5, q_au_1: 0.960, p_yr: 133.3 },
            { object_name: "81P/Wild", e: 0.540, i_deg: 3.2, q_au_1: 1.583, p_yr: 5.5 },
            { object_name: "67P/Churyumov-Gerasimenko", e: 0.641, i_deg: 7.0, q_au_1: 1.243, p_yr: 6.4 }
        ];
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-black border border-white rounded-lg">
                <h4 class="font-semibold text-white">Demo Data</h4>
                <p class="text-sm text-white">${demoComets.length} famous comets (offline mode)</p>
                <p class="text-xs text-white">Error: ${error.message}</p>
            </div>
            
            <div class="space-y-2">
                ${demoComets.map(comet => `
                    <div class="p-3 bg-black border border-white rounded-lg">
                        <div class="flex justify-between items-start">
                            <span class="font-semibold text-sm text-white">${comet.object_name}</span>
                            <span class="text-xs text-white">e=${comet.e.toFixed(3)}</span>
                        </div>
                        <div class="text-xs text-white mt-1">
                            <span>i: ${comet.i_deg.toFixed(1)}°</span>
                            <span class="ml-2">q: ${comet.q_au_1.toFixed(3)} AU</span>
                            <span class="ml-2">P: ${comet.p_yr.toFixed(1)} yr</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 p-3 bg-black border border-white rounded-lg text-xs text-white">
                <p><strong>Demo Mode:</strong> Showing ${demoComets.length} famous comets</p>
                <p>e=eccentricity, i=inclination, q=perihelion, P=period</p>
                <button onclick="loadCometData()" class="mt-2 px-3 py-1 bg-white hover:bg-black text-black hover:text-white rounded text-xs transition">
                    <i data-lucide="refresh-cw" class="w-3 h-3 inline mr-1"></i>
                    Retry NASA Data
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}
