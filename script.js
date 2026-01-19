// ================= CONFIG =================
const AIO_USERNAME = 'RocioVL';
const AIO_KEY      = 'SECRET_AIO_KEY_PLACEHOLDER'; // Recuerda poner tu key real aquí

const FEEDS = [
    { key: 'temperatura', label: 'Temperatura Corporal', unit: '°C', color: '#ff7675', elementId: 'temperatura' },
    { key: 'pulso', label: 'Pulso Cardíaco', unit: 'BPM', color: '#e84393', elementId: 'pulso' },
    { key: 'oxigeno', label: 'Saturación Oxígeno', unit: '%', color: '#0984e3', elementId: 'oxigeno' },
    { key: 'ambiente', label: 'Temp. Ambiente', unit: '°C', color: '#fdcb6e', elementId: 'ambiente' }
];

const chartsInstances = {}; 
let modalChartInstance = null; 
const globalDataCache = {};

async function updateAllFeeds() {
    FEEDS.forEach(feed => fetchData(feed));
}

async function fetchData(feedConfig) {
    const url = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedConfig.key}/data?limit=20`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'X-AIO-Key': AIO_KEY }
        });
        if (!response.ok) throw new Error('Error API');
        
        const data = await response.json();
        if (data.length === 0) return;

        // 1. Ordenamos cronológicamente (antiguo -> nuevo)
        const history = data.reverse();

        // === FILTRADO DE DATOS ===
        for (let i = 0; i < history.length; i++) {
            let val = parseFloat(history[i].value);

            // Filtro para Oxígeno
            if (feedConfig.key === 'oxigeno') {
                if ( val < 80 && i > 0) {
                    history[i].value = history[i - 1].value; 
                }
            }

            // Filtro para Pulso
            if (feedConfig.key === 'pulso') {
                if (val < 50 && i > 0) {
                    history[i].value = history[i - 1].value; 
                }
            }
            // Filtro para Temperatura
            if (feedConfig.key === 'temperatura') {
                if ((val < 30 || val > 50) && i > 0) {
                    history[i].value = history[i - 1].value; 
                }
            }
        }
        // =========================

        globalDataCache[feedConfig.key] = {
            labels: history.map(d => new Date(d.created_at).toLocaleTimeString()),
            values: history.map(d => d.value),
            lastValue: history[history.length - 1].value,
            lastDate: history[history.length - 1].created_at
        };

        updateCardUI(feedConfig, globalDataCache[feedConfig.key]);

        if (currentOpenFeed === feedConfig.key) {
            renderModalChart(feedConfig, globalDataCache[feedConfig.key]);
        }

    } catch (error) { console.error(error); }
}

function updateCardUI(config, dataObj) {
    // 1. Actualizar el VALOR (Esto siempre existe)
    const valElement = document.getElementById(`val-${config.elementId}`);
    if (valElement) {
        valElement.innerText = parseFloat(dataObj.lastValue).toFixed(1);
    }

    // 2. Actualizar la FECHA (Solo si existe el elemento en el HTML)
    const dateElement = document.getElementById(`date-${config.elementId}`);
    if (dateElement) {
        const d = new Date(dataObj.lastDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        
        dateElement.innerText = `Ultimo dato: ${day}/${month}/${year} a las ${hours}:${mins}`;
    }

    // 3. Actualizar la GRÁFICA (Solo si existe el canvas)
    const chartCanvas = document.getElementById(`chart-${config.elementId}`);
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');            
        
        if (chartsInstances[config.key]) {
            chartsInstances[config.key].data.labels = dataObj.labels;
            chartsInstances[config.key].data.datasets[0].data = dataObj.values;
            chartsInstances[config.key].update();
        } else {
            chartsInstances[config.key] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dataObj.labels,
                    datasets: [{
                        data: dataObj.values,
                        borderColor: config.color,
                        backgroundColor: config.color + '33',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 0,
                        fill: true
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: { x: { display: false }, y: { display: false } },
                    animation: false
                }
            });
        }
    }
}

let currentOpenFeed = null;
const modalElement = document.getElementById('detail-modal');

function openModal(feedKey) {
    const config = FEEDS.find(f => f.elementId === feedKey);
    if (!config || !globalDataCache[config.key]) return;

    currentOpenFeed = config.key;
    
    modalElement.style.display = 'flex';
    document.getElementById('modal-title').innerText = config.label;
    document.getElementById('modal-title').style.color = config.color;

    renderModalChart(config, globalDataCache[config.key]);
}

function closeModal() {
    modalElement.style.display = 'none';
    currentOpenFeed = null;
}

window.onclick = function(event) {
    if (event.target == modalElement) closeModal();
}

function renderModalChart(config, dataObj) {
    const ctx = document.getElementById('modal-chart').getContext('2d');

    if (modalChartInstance) {
        modalChartInstance.destroy();
    }

    modalChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataObj.labels,
            datasets: [{
                label: `${config.label} (${config.unit})`,
                data: dataObj.values,
                borderColor: config.color,
                backgroundColor: config.color + '20',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: config.color,
                fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { display: true },
                tooltip: { enabled: true, mode: 'index', intersect: false }
            },
            scales: {
                x: { display: true, grid: { display: false } },
                y: { display: true, grid: { color: '#eee' } }
            }
        }
    });
}

// Inicializar
updateAllFeeds();
setInterval(updateAllFeeds, 10000);