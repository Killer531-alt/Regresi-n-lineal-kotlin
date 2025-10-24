// app-fixed.js
// Mejoras:
// - Límite de ejes calculado correctamente (pad + evitar extensión infinita).
// - Validación robusta y mensajes claros.
// - Samples, CSV, copy, y opción de envío a backend (comentada).
// - Cumple con los requisitos del proyecto (entrada, validación, cálculo, visualización).

(() => {
  // Elementos DOM
  const input = document.getElementById('pointsInput');
  const calcBtn = document.getElementById('calcBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const fileInput = document.getElementById('fileInput');
  const uploadLabel = document.getElementById('uploadLabel');
  const msg = document.getElementById('msg');

  const eqEl = document.getElementById('equation');
  const statN = document.getElementById('stat-n');
  const statR2 = document.getElementById('stat-r2');
  const statM = document.getElementById('stat-m');
  const statB = document.getElementById('stat-b');

  // chart
  const ctx = document.getElementById('chart').getContext('2d');
  let chart = null;

  // Texto alineación -> [{x,y}, ...]
  function parsePoints(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const pts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Manejar separadores , ; o espacios
      const parts = line.split(/[,;]\s*|\s+/).map(s => s.trim()).filter(Boolean);
      if (parts.length !== 2) throw new Error(`Línea ${i+1}: formato inválido. Usa "x,y"`);
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      if (!isFinite(x) || !isFinite(y)) throw new Error(`Línea ${i+1}: valores no numéricos`);
      pts.push({ x, y });
    }
    return pts;
  }

  // Regresión lineal: retorna {m, b, r2, n}
  function linearRegression(points) {
    const n = points.length;
    if (n < 2) throw new Error('Se requieren al menos 2 puntos');

    const sumX = points.reduce((s,p) => s + p.x, 0);
    const sumY = points.reduce((s,p) => s + p.y, 0);
    const sumXY = points.reduce((s,p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s,p) => s + p.x * p.x, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumX2 - sumX * sumX;

    if (Math.abs(denominator) < 1e-12) throw new Error('No se puede calcular la pendiente: varianza de X ≈ 0 (x idénticos).');

    const m = numerator / denominator;
    const b = (sumY - m * sumX) / n;

    // R^2
    const meanY = sumY / n;
    const ssTot = points.reduce((s,p) => s + Math.pow(p.y - meanY, 2), 0);
    const ssRes = points.reduce((s,p) => s + Math.pow(p.y - (m * p.x + b), 2), 0);
    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

    return { m, b, r2, n };
  }

  // Computar límites de ejes con padding
  function computeBounds(points, linePoints) {
    // Tomar todos los x,y
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    if (linePoints && linePoints.length) {
      xs.push(...linePoints.map(p => p.x));
      ys.push(...linePoints.map(p => p.y));
    }
    // Retornar valores por defecto si no hay puntos
    if (xs.length === 0) {
      return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
    }
    let xMin = Math.min(...xs);
    let xMax = Math.max(...xs);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);

    // Si todos los x o y son iguales, expandir un poco
    if (xMax - xMin < 1e-6) { xMin -= 1; xMax += 1; }
    if (yMax - yMin < 1e-6) { yMin -= 1; yMax += 1; }

    // Agregar padding del 10%
    const padX = (xMax - xMin) * 0.10;
    const padY = (yMax - yMin) * 0.10;
    xMin = xMin - padX;
    xMax = xMax + padX;
    yMin = yMin - padY;
    yMax = yMax + padY;

    // Redondear límites a números "bonitos"
    function nice(n) {
      const pow = Math.pow(10, Math.floor(Math.log10(Math.abs(n || 1))));
      return Math.round(n / pow) * pow;
    }
    return { xMin, xMax, yMin, yMax };
  }

  // Dibujar gráfico
  function drawChart(points, line) {
    const datasets = [
      {
        label: 'Datos',
        data: points.map(p => ({ x: p.x, y: p.y })),
        showLine: false,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(110,231,183,0.95)'
      }
    ];
    if (line && line.length) {
      datasets.push({
        label: 'Regresión',
        data: line.map(p => ({ x: p.x, y: p.y })),
        type: 'line',
        borderWidth: 2,
        borderColor: 'rgba(96,165,250,0.95)',
        tension: 0,
        pointRadius: 0
      });
    }

    // Computar límites
    const bounds = computeBounds(points, line);
    const config = {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cfe8ff' } }
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: bounds.xMin,
            max: bounds.xMax,
            ticks: { color: '#cfe8ff' },
            grid: { color: 'rgba(255,255,255,0.03)' }
          },
          y: {
            min: bounds.yMin,
            max: bounds.yMax,
            ticks: { color: '#cfe8ff' },
            grid: { color: 'rgba(255,255,255,0.03)' }
          }
        }
      }
    };

    if (chart) chart.destroy();
    chart = new Chart(ctx, config);
  }

  // Ver resultados
  function showResult({ m, b, r2, n }) {
    eqEl.innerHTML = `Ecuación: <strong>y = ${m.toFixed(4)}x ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(4)}</strong>`;
    statN.textContent = n;
    statR2.textContent = r2.toFixed(4);
    statM.textContent = m.toFixed(6);
    statB.textContent = b.toFixed(6);
  }

  function showError(text) {
    msg.innerHTML = `<div class="error">${text}</div>`;
  }
  function clearError() { msg.innerHTML = ''; }

  // Acción calcular
  async function handleCalculate() {
    clearError();
    try {
      const pts = parsePoints(input.value);
      const res = linearRegression(pts);
      // Preparar puntos de línea
      const xs = pts.map(p => p.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const linePts = [{ x: minX, y: res.m * minX + res.b }, { x: maxX, y: res.m * maxX + res.b }];

      // Dibujar y mostrar
      drawChart(pts, linePts);
      showResult(res);

    } catch (err) {
      showError(err.message || String(err));
      // Limpiar gráfico y resultados
      drawChart([], null);
      eqEl.innerHTML = `Ecuación: <strong>—</strong>`;
      statN.textContent = '-'; statR2.textContent = '-'; statM.textContent = '-'; statB.textContent = '-';
    }
  }

  // Cargar CSV
  uploadLabel.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Base: limpiar líneas vacías y espacios
      input.value = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean).join('\n');
      msg.textContent = 'CSV cargado. Revisa y pulsa Calcular.';
      setTimeout(()=> msg.textContent = '', 2500);
    };
    reader.readAsText(file);
  });

  // Copiar ecuación
  copyBtn.addEventListener('click', () => {
    const eq = eqEl.innerText.replace('Ecuación:', '').trim();
    if (!eq || eq === '—') { showError('No hay ecuación para copiar'); return; }
    navigator.clipboard?.writeText(eq).then(() => {
      msg.textContent = 'Ecuación copiada al portapapeles';
      setTimeout(()=> msg.textContent = '', 1800);
    }).catch(()=> showError('No se pudo copiar'));
  });

  //Ejemplos
  document.querySelectorAll('button[data-sample]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.sample;
      if (s === 'easy') input.value = '1,1\n2,2\n3,3\n4,4\n5,5';
      if (s === 'noisy') input.value = '1,1.1\n2,1.9\n3,3.2\n4,4.1\n5,4.7\n6,6.3';
      if (s === 'vertical') input.value = '2,1\n2,2\n2,3';
      clearError();
    });
  });

  // Eventos botones
  calcBtn.addEventListener('click', handleCalculate);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearError();
    drawChart([], null);
    eqEl.innerHTML = `Ecuación: <strong>—</strong>`;
    statN.textContent = '-'; statR2.textContent = '-'; statM.textContent = '-'; statB.textContent = '-';
  });

  // Empezar con gráfico vacío
  drawChart([], null);

  // Backend envio
  async function sendToBackend(points) {
    try {
      const resp = await fetch('/api/regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(points)
      });
      return await resp.json();
    } catch(err) { console.warn('Backend not available', err); return null; }
  }
})();
