/* 
   Mock Data Engine for TV Analytics Dashboard
   Genera datasets estadísticamente plausibles para Retailers
*/

const DataEngine = {
    // Generar referencias comerciales para ARA (> 2000 records approx)
    generateAraData() {
        const categories = ['carnes', 'lacteos', 'promociones'];
        const references = {
            'carnes': ['Res Premium', 'Cerdo Familiar', 'Pollo Entero', 'Carne Molida'],
            'lacteos': ['Leche Entera', 'Queso Tajado', 'Yogurt Litro', 'Mantequilla'],
            'promociones': ['Aniversario', 'Madrugón', 'Fin de Mes', 'Canasta Básica']
        };

        const data = [];
        // Creamos ~2500 registros aleatorios
        for (let i = 0; i < 2500; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const refList = references[cat];
            const ref = refList[Math.floor(Math.random() * refList.length)];
            
            // Frecuencia simulada (Promociones tienen picos más altos)
            let baseFreq = cat === 'promociones' ? 15 : 5;
            const frequency = Math.floor(Math.random() * 10) + baseFreq;
            
            data.push({
                id: `ARA-${i}`,
                brand: 'ARA',
                category: cat,
                reference: ref,
                frequency: frequency,
                duration: Math.random() > 0.5 ? '20' : '30',
                cost: frequency * (Math.random() > 0.5 ? 1200000 : 1800000) // Costo x emisión
            });
        }
        return data;
    },

    // Generar datos de Inversión y TRP para D1
    generateD1Data() {
        const data = [];
        // D1 se enfoca en eficiencia, muchos spots, franjas prime y day time
        const slots = ['Prime Time', 'Day Time', 'Late Night', 'Early Morning'];
        const categories = ['promociones', 'lacteos'];

        for (let i = 0; i < 1500; i++) {
            const duration = Math.random() > 0.6 ? '20' : '30';
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const slot = slots[Math.floor(Math.random() * slots.length)];
            
            // 20s es más barato pero menor TRP que 30s. Prime time más caro.
            let baseCost = duration === '20' ? 1000000 : 1500000;
            let mult = slot === 'Prime Time' ? 2 : (slot === 'Day Time' ? 1.2 : 0.6);
            
            let cost = baseCost * mult * (0.9 + Math.random() * 0.2); // +/- 10% varianza
            
            // TRP estimado (Impacto)
            let baseTrp = duration === '20' ? 2.0 : 3.5;
            let trpMult = slot === 'Prime Time' ? 2.5 : 1.0;
            let trp = baseTrp * trpMult * (0.8 + Math.random() * 0.4);

            data.push({
                id: `D1-${i}`,
                brand: 'D1',
                category: cat,
                duration: duration,
                slot: slot,
                cost: Math.round(cost),
                trp: parseFloat(trp.toFixed(2)),
                frequency: Math.floor(Math.random() * 5) + 1
            });
        }
        return data;
    },

    // Generar datos de Alcance y Casos de Olímpica
    generateOlimpicaData() {
        const data = [];
        // Olímpica se enfoca en nichos, promociones de fin de semana, menos frecuencia pero alto alcance regional
        const segments = ['Amas de Casa', 'Jóvenes Adultos', 'Familias', 'Pensionados'];
        const categories = ['promociones', 'carnes', 'lacteos'];

        for (let i = 0; i < 800; i++) {
            const segment = segments[Math.floor(Math.random() * segments.length)];
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const duration = Math.random() > 0.3 ? '30' : '20'; // Más de 30s

            // Alcance bruto (Reach) en miles
            let reach = Math.floor(Math.random() * 500) + 200; 
            if(cat === 'promociones') reach += 300;

            // Casos (Impacto en ventas / atribución)
            let conversionRate = 0.015 + (Math.random() * 0.02); // 1.5% - 3.5%
            let cases = Math.floor(reach * 1000 * conversionRate);

            data.push({
                id: `OLI-${i}`,
                brand: 'Olimpica',
                category: cat,
                segment: segment,
                duration: duration,
                reach: reach,
                cases: cases,
                frequency: Math.floor(Math.random() * 4) + 1,
                cost: cases * 45 // CPA estimado inverso
            });
        }
        return data;
    },

    // Inicializar todo
    init() {
        this.araData = this.generateAraData();
        this.d1Data = this.generateD1Data();
        this.olimpicaData = this.generateOlimpicaData();
        this.allData = [...this.araData, ...this.d1Data, ...this.olimpicaData];
        return this.allData;
    },

    // Funciones de Filtrado Global
    getFilteredData(brandFilter, productFilter, durationFilter) {
        return this.allData.filter(item => {
            const matchBrand = brandFilter === 'all' || item.brand.toLowerCase() === brandFilter.toLowerCase();
            const matchCategory = productFilter === 'all' || item.category === productFilter;
            const matchDuration = durationFilter === 'all' || item.duration === durationFilter;
            return matchBrand && matchCategory && matchDuration;
        });
    }
};

// Autoload
DataEngine.init();
