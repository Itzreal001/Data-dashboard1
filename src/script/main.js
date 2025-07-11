import '../style/style.css';
import { parseCSV, fetchAPIData } from './dataImporter.js';

// Inject UI placeholders
document.getElementById('chartBuilder').innerHTML = `
  <h2>📐 Chart Builder</h2>
  <label>Chart Type:</label>
  <select id="chartType">
    <option value="bar">Bar</option>
    <option value="line">Line</option>
    <option value="pie">Pie</option>
    <option value="scatter">Scatter</option>
  </select>
  <br><br>

  <label>X-Axis Key:</label>
  <select id="xKey"></select>
  <br><br>

  <label>Y-Axis Key:</label>
  <select id="yKey"></select>
  <br><br>

  <label>Animation Speed (ms):</label>
  <input type="range" id="animDuration" min="100" max="3000" step="100" value="1000" />
  <span id="durationDisplay">1000ms</span>
  <br><br>

  <label>Animation Easing:</label>
  <select id="animEasing">
    <option value="easeOutQuart">easeOutQuart</option>
    <option value="easeInOutCubic">easeInOutCubic</option>
    <option value="easeOutBounce">easeOutBounce</option>
    <option value="easeInOutElastic">easeInOutElastic</option>
    <option value="linear">linear</option>
  </select>
  <br><br>
   <div class="button-row">
    <button id="previewChart"><span class="material-icons">bar_chart</span> Preview Chart</button>
    <button id="saveDashboard"><span class="material-icons">save</span> Save Config</button>
    <button id="loadDashboard"><span class="material-icons">folder_open</span> Load Config</button>
    <button id="exportChart"><span class="material-icons">file_download</span> Export PNG</button>
  </div>
`;
document.getElementById('filterSection').innerHTML = `
  <h2>🔎 Filters</h2>
  <label>Date Range:</label>
  <input type="date" id="startDate" /> to <input type="date" id="endDate" />
  <br><br>
  <label>Keyword Filter:</label>
  <input type="text" id="keywordFilter" placeholder="Search..." />
`;


const animSlider = document.getElementById('animDuration');
const durationText = document.getElementById('durationDisplay');

animSlider.addEventListener('input', () => {
  durationText.textContent = `${animSlider.value}ms`;
});

// CSV upload
document.getElementById('csvUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const data = await parseCSV(file);
    window.dashboardData = data;
    populateKeyOptions(data);
  }
});


// API fetch
document.getElementById('fetchAPI').addEventListener('click', async () => {
  const data = await fetchAPIData('https://api.covid19api.com/summary');
  window.dashboardData = data.Countries;
  populateKeyOptions(data.Countries);
});

function populateKeyOptions(data) {
  

  const xKeySelect = document.getElementById('xKey');
  const yKeySelect = document.getElementById('yKey');
  console.log('Received data:', data);
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data found or file is empty.');
    return;
  }

  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    alert('Invalid data structure');
    return;
  }

  const keys = Object.keys(firstRow);
  if (!keys.length) {
    alert('No valid columns in data');
    return;
  }

  xKeySelect.innerHTML = '';
  yKeySelect.innerHTML = '';

  keys.forEach(key => {
    xKeySelect.appendChild(new Option(key, key));
    yKeySelect.appendChild(new Option(key, key));
  });
}

// Chart preview click handler
function filterData(data) {
  const keyword = document.getElementById('keywordFilter').value.toLowerCase();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  return data.filter(item => {
    const matchKeyword = keyword
      ? Object.values(item).some(v => String(v).toLowerCase().includes(keyword))
      : true;

    const dateField = item.date || item.Date;
    const matchDate = (startDate || endDate) && dateField
      ? (!startDate || new Date(dateField) >= new Date(startDate)) &&
        (!endDate || new Date(dateField) <= new Date(endDate))
      : true;

    return matchKeyword && matchDate;
  });
}

document.getElementById('previewChart').addEventListener('click', () => {
  const type = document.getElementById('chartType').value;
  const xKey = document.getElementById('xKey').value;
  const yKey = document.getElementById('yKey').value;
  const rawData = window.dashboardData || [];

  const data = filterData(rawData);

  if (!data.length || !xKey || !yKey) {
    alert('Please upload data and fill all fields.');
    return;
  }

  const labels = data.map(d => d[xKey]);
  const values = data.map(d => Number(d[yKey]));

  const dashboard = document.getElementById('dashboard');
  dashboard.innerHTML = '';
  const canvas = document.createElement('canvas');
  dashboard.appendChild(canvas);

 import('chart.js/auto').then(({ default: Chart }) => {
   const duration = parseInt(document.getElementById('animDuration').value);
const easing = document.getElementById('animEasing').value;

new Chart(canvas, {
  type,
  data: {
    labels,
    datasets: [{
      label: `${yKey} by ${xKey}`,
      data: values,
      borderColor: '#00bcd4',
      backgroundColor: 'rgba(0,188,212,0.2)',
      borderWidth: 2,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    animation: {
      duration,
      easing
    },
    plugins: {
      legend: {
        labels: {
          color: document.body.classList.contains('dark') ? '#eee' : '#333'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: document.body.classList.contains('dark') ? '#ccc' : '#444'
        }
      },
      y: {
        ticks: {
          color: document.body.classList.contains('dark') ? '#ccc' : '#444'
        }
      }
    }
  }
});
});

function saveDashboardConfig() {
  const config = {
    chartType: document.getElementById('chartType').value,
    xKey: document.getElementById('xKey').value,
    yKey: document.getElementById('yKey').value
  };
  localStorage.setItem('dashboardConfig', JSON.stringify(config));
  alert('Dashboard configuration saved!');
}

function loadDashboardConfig() {
  const config = JSON.parse(localStorage.getItem('dashboardConfig'));
  if (config) {
    document.getElementById('chartType').value = config.chartType;
    document.getElementById('xKey').value = config.xKey;
    document.getElementById('yKey').value = config.yKey;
    alert('Configuration loaded. Click "Preview Chart" to view it.');
  } else {
    alert('No saved configuration found.');
  }
}

document.getElementById('saveDashboard').addEventListener('click', saveDashboardConfig);
document.getElementById('loadDashboard').addEventListener('click', loadDashboardConfig)

// Load saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

document.getElementById('exportChart').addEventListener('click', () => {
  const canvas = document.querySelector('#dashboard canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'chart.png';
    link.click();
  } else {
    alert('No chart to export!');
  }
});
});