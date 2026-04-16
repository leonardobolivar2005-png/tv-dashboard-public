/* 
   Charts rendering logic using Chart.js - McKinsey Style Upgrade
*/

const COLORS = {
    ARA: '#be123c',     /* Deep Red */
    D1: '#ca8a04',      /* Deep Gold/Yellow */
    Olimpica: '#1d4ed8',/* Deep Blue */
    Grid: '#e2e8f0',
    Text: '#475569'
};

const ChartsManager = {
    instances: {},

    getCommonOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: {family: 'Inter', size: 11} } },
                title: { display: false } // We use HTML native titles for better styling
            },
            scales: {
                x: { grid: { color: COLORS.Grid } },
                y: { grid: { color: COLORS.Grid } }
            }
        };
    },

    destroyAll() {
        Object.values(this.instances).forEach(chart => {
            if (chart) chart.destroy();
        });
    },

    renderAll(filteredData) {
        this.destroyAll();
        const araData = filteredData.filter(d => d.brand === 'ARA');
        const d1Data = filteredData.filter(d => d.brand === 'D1');
        const olimpicaData = filteredData.filter(d => d.brand === 'Olimpica');

        this.renderFreqDistribution(araData, d1Data, olimpicaData);
        this.renderTopBrandsAra(araData);
        this.renderCostImpactD1(d1Data);
        this.renderInvestmentSplits(d1Data);
        this.renderReachOlimpica(olimpicaData);
        this.renderStrategicRadar([araData, d1Data, olimpicaData]);
    },

    renderFreqDistribution(ara, d1, oli) {
        const ctx = document.getElementById('freqDistributionChart').getContext('2d');
        const groupFreq = (data) => {
            let bins = { '1-5':0, '6-10':0, '11-15':0, '16-20':0, '>20': 0 };
            data.forEach(d => {
                let f = d.frequency || 0;
                if(f<=5) bins['1-5']++; else if(f<=10) bins['6-10']++; else if(f<=15) bins['11-15']++; else if(f<=20) bins['16-20']++; else bins['>20']++;
            });
            return Object.values(bins);
        };

        this.instances.freqDist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1-5', '6-10', '11-15', '16-20', '>20'],
                datasets: [
                    { label: 'ARA', data: groupFreq(ara), backgroundColor: COLORS.ARA, borderRadius: 2 },
                    { label: 'D1', data: groupFreq(d1), backgroundColor: COLORS.D1, borderRadius: 2 },
                    { label: 'Olímpica', data: groupFreq(oli), backgroundColor: COLORS.Olimpica, borderRadius: 2 }
                ]
            },
            options: {
                ...this.getCommonOptions(),
                scales: { 
                    x: { title: {display:true, text:'Rango de Reparición (Frecuencia)', font:{size:10}} },
                    y: { title: {display:true, text:'Volumen de Spots', font:{size:10}} }
                }
            }
        });
    },

    renderTopBrandsAra(ara) {
        const ctx = document.getElementById('topBrandsAraChart').getContext('2d');
        const agg = {};
        ara.forEach(d => { if(d.reference) agg[d.reference] = (agg[d.reference] || 0) + d.frequency; });
        let sorted = Object.entries(agg).sort((a,b)=>b[1]-a[1]).slice(0,5);
        
        this.instances.topAra = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map(i => i[0]),
                datasets: [{ label: 'Frecuencia Total', data: sorted.map(i => i[1]), backgroundColor: COLORS.ARA, borderRadius: 2 }]
            },
            options: { ...this.getCommonOptions(), indexAxis: 'y' }
        });
    },

    renderCostImpactD1(d1) {
        const ctx = document.getElementById('costImpactD1Chart').getContext('2d');
        let data20s = d1.filter(d => d.duration === '20').map(d => ({x: d.trp || 0, y: d.cost || 0})).slice(0, 150);
        let data30s = d1.filter(d => d.duration === '30').map(d => ({x: d.trp || 0, y: d.cost || 0})).slice(0, 150);

        this.instances.costD1 = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: '20 seg', data: data20s, backgroundColor: COLORS.D1 },
                    { label: '30 seg', data: data30s, backgroundColor: '#9a3412', marker: 'rect' }
                ]
            },
            options: {
                ...this.getCommonOptions(),
                scales: { x: { title: {display:true, text:'TRP Estimado'} }, y: { title: {display:true, text:'Costo (COP)'} } }
            }
        });
    },

    renderInvestmentSplits(d1) {
        const ctx = document.getElementById('investmentChart').getContext('2d');
        const slots = ['Prime Time', 'Day Time', 'Late Night', 'Early Morning'];
        const data20 = []; const data30 = [];
        slots.forEach(slot => {
            const slotData = d1.filter(d => d.slot === slot);
            data20.push(slotData.filter(d=>d.duration==='20').reduce((acc, a) => acc + (a.cost||0), 0) / 1000000);
            data30.push(slotData.filter(d=>d.duration==='30').reduce((acc, a) => acc + (a.cost||0), 0) / 1000000);
        });

        this.instances.invSp = new Chart(ctx, {
            type: 'bar',
            data: { labels: slots, datasets: [ { label: 'Costo 20s (MM)', data: data20, backgroundColor: COLORS.D1 }, { label: 'Costo 30s (MM)', data: data30, backgroundColor: '#fef08a' } ] },
            options: { ...this.getCommonOptions(), scales: { x: { stacked: true }, y: { stacked: true } } }
        });
    },

    renderReachOlimpica(oli) {
        const ctx = document.getElementById('reachOlimpicaChart').getContext('2d');
        let agg = {};
        oli.forEach(d => {
            if(!agg[d.segment]) agg[d.segment] = { reach: 0, cases: 0 };
            agg[d.segment].reach += (d.reach || 0); agg[d.segment].cases += (d.cases || 0);
        });
        const labels = Object.keys(agg);
        
        this.instances.reachOli = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { type: 'bar', label: 'Casos Atribuidos', data: labels.map(l => agg[l].cases), backgroundColor: COLORS.Olimpica, yAxisID: 'y' },
                    { type: 'line', label: 'Alcance Bruto (Miles)', data: labels.map(l => agg[l].reach), borderColor: '#38bdf8', borderWidth: 3, yAxisID: 'y1' }
                ]
            },
            options: {
                ...this.getCommonOptions(),
                scales: {
                    y: { type: 'linear', position: 'left' },
                    y1: { type: 'linear', position: 'right', grid:{drawOnChartArea:false} }
                }
            }
        });
    },

    renderStrategicRadar([ara, d1, oli]) {
        const ctx = document.getElementById('strategicRadarChart').getContext('2d');
        const getScore = (data, mK, isAvg=false) => { if(data.length===0) return 0; const sum = data.reduce((a,b) => a+(b[mK]||0), 0); return isAvg ? sum/data.length : sum; };

        const fAra = getScore(ara, 'frequency', true); const fD1 = getScore(d1, 'frequency', true); const fOli = getScore(oli, 'frequency', true);
        const maxF = Math.max(fAra, fD1, fOli, 1);
        
        this.instances.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Presión Publicitaria', 'Eficiencia Costo/TRP', 'Cobertura Mass', 'Conversión Directa', 'Frecuencia Pura'],
                datasets: [
                    { label: 'ARA', data: [90, 50, 45, 50, (fAra/maxF)*100], backgroundColor: COLORS.ARA+'22', borderColor: COLORS.ARA, borderWidth: 2 },
                    { label: 'D1', data: [75, 95, 60, 70, (fD1/maxF)*100], backgroundColor: COLORS.D1+'22', borderColor: COLORS.D1, borderWidth: 2 },
                    { label: 'Olímpica', data: [40, 65, 95, 90, (fOli/maxF)*100], backgroundColor: COLORS.Olimpica+'22', borderColor: COLORS.Olimpica, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    r: { angleLines: { color: COLORS.Grid }, grid: { color: COLORS.Grid }, pointLabels: { color: COLORS.Text, font:{size:10} }, ticks: { display:false, max:100, min:0 } }
                }
            }
        });
    }
};
