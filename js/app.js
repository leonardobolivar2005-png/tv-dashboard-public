/* 
   Main App Controller - Strategic McKinsey Edition
*/

const App = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateDashboard();
    },

    cacheDOM() {
        this.brandFilter = document.getElementById('brand-filter');
        this.productFilter = document.getElementById('product-filter');
        this.durationFilter = document.getElementById('duration-filter');
        this.btnApply = document.getElementById('apply-filters');
        this.btnReset = document.getElementById('reset-filters');

        this.kpiSpots = document.getElementById('kpi-spots');
        this.kpiInv = document.getElementById('kpi-investment');
        this.kpiReach = document.getElementById('kpi-reach');
        this.kpiFreq = document.getElementById('kpi-freq');
        
        this.heatmapContainer = document.getElementById('tactical-heatmap');
    },

    bindEvents() {
        this.btnApply.addEventListener('click', () => this.updateDashboard());
        this.btnReset.addEventListener('click', () => {
            this.brandFilter.value = 'all';
            this.productFilter.value = 'all';
            this.durationFilter.value = 'all';
            this.updateDashboard();
        });
        
        this.brandFilter.addEventListener('change', () => this.updateDashboard());
        this.productFilter.addEventListener('change', () => this.updateDashboard());
        this.durationFilter.addEventListener('change', () => this.updateDashboard());
    },

    formatCurrency(value) {
        if(value >= 1000000000) return `$${(value/1000000000).toFixed(1)}B`;
        if(value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
        return `$${value.toLocaleString('es-CO')}`;
    },
    
    formatNumber(value) {
        if(value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
        if(value >= 1000) return `${(value/1000).toFixed(1)}K`;
        return value.toLocaleString('es-CO');
    },

    updateKPIs(filteredData, allData) {
        // Calculate global context to show +% or -%
        const totalSpots = filteredData.length;
        const totalInv = filteredData.reduce((acc, curr) => acc + (curr.cost || 0), 0);
        const totalReach = filteredData.reduce((acc, curr) => acc + (curr.reach || 0), 0);
        const avgFreq = totalSpots > 0 ? (filteredData.reduce((acc, curr) => acc + (curr.frequency || 0), 0) / totalSpots).toFixed(1) : 0;

        this.kpiSpots.textContent = this.formatNumber(totalSpots);
        this.kpiInv.textContent = this.formatCurrency(totalInv);
        this.kpiReach.textContent = totalReach > 0 ? this.formatNumber(totalReach) : 'N/A';
        this.kpiFreq.textContent = `${avgFreq}x`;
        
        // We could dynamically update interpretations, but they are relatively static on the UI
        // except for highlighting trend if it was compared to another time period.
        // For now, the texts in the HTML serve the McKinsey storytelling well.
    },

    renderNativeHeatmap(ara, d1, oli) {
        this.heatmapContainer.innerHTML = '';
        
        // Headers
        const headerRow = document.createElement('div');
        headerRow.className = 'heatmap-row';
        headerRow.innerHTML = `
            <div class="heatmap-label"></div>
            <div class="heatmap-col-header">Frecuencia</div>
            <div class="heatmap-col-header">CPA / Eficiencia</div>
            <div class="heatmap-col-header">Cobertura</div>
        `;
        this.heatmapContainer.appendChild(headerRow);

        // Compute scores
        const getSum = (arr, key) => arr.reduce((a,b)=>a+(b[key]||0),0);
        let fA = getSum(ara, 'frequency');
        let fD = getSum(d1, 'frequency');
        let fO = getSum(oli, 'frequency');
        
        let cA = ara.length > 0 ? getSum(ara, 'cost')/ara.length : 0;
        let cD = d1.length > 0 ? getSum(d1, 'cost')/d1.length : 0;
        let cO = oli.length > 0 ? getSum(oli, 'cost')/oli.length : 0;
        
        // Invert Cost for efficiency
        let maxC = Math.max(cA, cD, cO);
        let eA = maxC - cA;
        let eD = maxC - cD;
        let eO = maxC - cO;

        let rA = getSum(ara, 'reach');
        let rD = getSum(d1, 'reach');
        let rO = getSum(oli, 'reach');

        const mapColor = (val, max) => {
            if(max === 0) return 'min';
            const r = val / max;
            if(r > 0.8) return 'high';
            if(r > 0.4) return 'med';
            if(r > 0.1) return 'low';
            return 'min';
        };

        const renderRow = (brand, label, f, e, r, mF, mE, mR) => {
            return `
            <div class="heatmap-row">
                <div class="heatmap-label">${label}</div>
                <div class="cell" data-val="${mapColor(f, mF)}"></div>
                <div class="cell" data-val="${mapColor(e, mE)}"></div>
                <div class="cell" data-val="${mapColor(r, mR)}"></div>
            </div>`;
        };

        const maxF = Math.max(fA, fD, fO);
        const maxE = Math.max(eA, eD, eO);
        const maxR = Math.max(rA, rD, rO);

        this.heatmapContainer.innerHTML += renderRow('ARA', 'ARA', fA, eA, rA, maxF, maxE, maxR);
        this.heatmapContainer.innerHTML += renderRow('D1', 'D1', fD, eD, rD, maxF, maxE, maxR);
        this.heatmapContainer.innerHTML += renderRow('Olimpica', 'Olímpica', fO, eO, rO, maxF, maxE, maxR);
    },

    updateDashboard() {
        const brand = this.brandFilter.value;
        const product = this.productFilter.value;
        const duration = this.durationFilter.value;

        const filteredData = DataEngine.getFilteredData(brand, product, duration);

        this.updateKPIs(filteredData, DataEngine.allData);
        ChartsManager.renderAll(filteredData);
        
        // Segregate for heatmap explicitly
        const ara = filteredData.filter(d => d.brand === 'ARA');
        const d1 = filteredData.filter(d => d.brand === 'D1');
        const oli = filteredData.filter(d => d.brand === 'Olimpica');
        this.renderNativeHeatmap(ara, d1, oli);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
