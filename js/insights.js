/* 
   Automated Strategic Insights Engine - Secondary Layer
   (Main insights are handled visually through storytelling and static blocks)
*/

const InsightsEngine = {
    generate(filteredData) {
        // We can dynamically update the KPI interpretations based on filters
        const invInsightText = document.getElementById('kpi-inv-insight');
        if(!invInsightText) return;

        if (filteredData.length === 0) {
            invInsightText.textContent = "Datos insuficientes.";
            return;
        }

        const ara = filteredData.filter(d => d.brand === 'ARA');
        const d1 = filteredData.filter(d => d.brand === 'D1');
        const oli = filteredData.filter(d => d.brand === 'Olimpica');

        let maxInvBrand = 'N/A';
        let araI = ara.reduce((a,b)=>a+(b.cost||0),0);
        let d1I = d1.reduce((a,b)=>a+(b.cost||0),0);
        let oliI = oli.reduce((a,b)=>a+(b.cost||0),0);

        if(araI >= d1I && araI >= oliI && araI > 0) maxInvBrand = 'ARA';
        else if(d1I >= araI && d1I >= oliI && d1I > 0) maxInvBrand = 'D1';
        else if(oliI > 0) maxInvBrand = 'Olímpica';

        if(maxInvBrand !== 'N/A') {
            invInsightText.textContent = `Concentración de capital liderada por ${maxInvBrand} en el segmento actual.`;
        } else {
            invInsightText.textContent = `Presupuesto distribuido simétricamente.`;
        }
    }
};
