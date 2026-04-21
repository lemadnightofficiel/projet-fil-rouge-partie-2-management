// Calcul pour l'US-08 (dans la fonction render de renderDashboard)
const atRisk = fd.filter(r => r.risque === 'Élevé' || r.risque === 'Critique').length;

// Affichage de la carte métrique US-08
c.innerHTML = `
  <div class="metric-card">
    <div class="metric-label">Clients à risque</div>
    <div class="metric-value" style="color:var(--red)">${atRisk}</div>
    <div class="metric-sub">${fd.length ? Math.round(atRisk / fd.length * 100) : 0}% du portefeuille</div>
  </div>
`;

// Affichage du détail par niveau de risque (Barres de progression)
{RISK_LEVELS.map(r => `
  <div class="risk-row">
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:8px;height:8px;border-radius:50%;background:${riskColors[r]};"></div>
      <span>${r}</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${Math.round(riskCounts[r] / Math.max(fd.length, 1) * 100)}%; background:${riskColors[r]};"></div>
      </div>
      <span>${riskCounts[r]}</span>
    </div>
  </div>`).join('')}