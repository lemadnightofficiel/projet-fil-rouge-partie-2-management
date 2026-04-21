
/* ============ DASHBOARD ============ */
function renderDashboard(c) {
  if (!state.data.length) { c.innerHTML=`<div class="empty">Aucune donnée chargée. <span style="color:var(--blue);cursor:pointer" onclick="navigate('import')">Importer un fichier →</span></div>`; return; }
  
  let filterSeg = '', filterRisk = '';
  
  function filtered() {
    return state.data.filter(r=>{
      if (filterSeg && r.segment !== filterSeg) return false;
      if (filterRisk && r.risque !== filterRisk) return false;
      return true;
    });
  }
  
  function render() {
    const fd = filtered();
    const totalCA = fd.reduce((s,r)=>s+(parseFloat(r.ca)||0),0);
    const atRisk = fd.filter(r=>r.risque==='Élevé'||r.risque==='Critique').length;
    
    const segCounts = {};
    SEGMENTS.forEach(s=>segCounts[s]=0);
    fd.forEach(r=>{ if(segCounts[r.segment]!==undefined) segCounts[r.segment]++; });
    const maxSeg = Math.max(...Object.values(segCounts),1);
    
    const riskCounts = {};
    RISK_LEVELS.forEach(r=>riskCounts[r]=0);
    fd.forEach(r=>{ if(riskCounts[r.risque]!==undefined) riskCounts[r.risque]++; });
    
    const riskColors = {'Faible':'var(--green)','Moyen':'var(--amber)','Élevé':'var(--red)','Critique':'#500'};
    const segColors = {'Premium':'var(--purple)','VIP':'var(--teal)','Standard':'var(--blue)','Basic':'var(--amber)'};
    
    c.innerHTML = `
      <div class="gap-16">
        <div class="filters">
          <select class="filter-select" id="f-seg" onchange="window._dashFilter('seg',this.value)">
            <option value="">Tous les segments</option>
            ${SEGMENTS.map(s=>`<option value="${s}" ${filterSeg===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <select class="filter-select" id="f-risk" onchange="window._dashFilter('risk',this.value)">
            <option value="">Tous les niveaux de risque</option>
            ${RISK_LEVELS.map(r=>`<option value="${r}" ${filterRisk===r?'selected':''}>${r}</option>`).join('')}
          </select>
          <span style="font-size:11px;color:var(--text2);font-family:sans-serif;padding:6px 0;">${fd.length} client(s) affichés</span>
        </div>
        <div class="metric-grid">
          <div class="metric-card"><div class="metric-label">Total clients</div><div class="metric-value">${fd.length}</div></div>
          <div class="metric-card"><div class="metric-label">Chiffre d'affaires</div><div class="metric-value" style="font-size:20px;">${totalCA.toLocaleString('fr-FR')} €</div></div>
          <div class="metric-card"><div class="metric-label">Clients à risque</div><div class="metric-value" style="color:var(--red)">${atRisk}</div><div class="metric-sub">${fd.length?Math.round(atRisk/fd.length*100):0}% du portefeuille</div></div>
          <div class="metric-card"><div class="metric-label">Satisfaction moy.</div><div class="metric-value">${fd.length?( fd.reduce((s,r)=>s+(parseFloat(r.satisfaction)||0),0)/fd.filter(r=>r.satisfaction).length||0 ).toFixed(1):'—'} <span style="font-size:14px;color:var(--text2);">/10</span></div></div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="section-label" style="font-family:sans-serif;">Répartition par segment</div>
            <div class="bar-chart">
              ${SEGMENTS.map(s=>`<div class="bar-row"><div class="bar-label">${s}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(segCounts[s]/maxSeg*100)}%;background:${segColors[s]};"></div></div><div class="bar-count">${segCounts[s]}</div></div>`).join('')}
            </div>
          </div>
          <div class="card">
            <div class="section-label" style="font-family:sans-serif;">Clients à risque</div>
            ${RISK_LEVELS.map(r=>`
              <div class="risk-row">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:8px;height:8px;border-radius:50%;background:${riskColors[r]};flex-shrink:0;"></div>
                  <span style="font-size:13px;font-family:sans-serif;">${r}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:80px;" class="progress-bar"><div class="progress-fill" style="width:${Math.round(riskCounts[r]/Math.max(fd.length,1)*100)}%;background:${riskColors[r]};"></div></div>
                  <span style="font-size:13px;font-family:sans-serif;font-weight:500;min-width:20px;">${riskCounts[r]}</span>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="section-label" style="font-family:sans-serif;">Détail clients filtrés</div>
          <div class="table-wrap"><table>
            <thead><tr><th>Client</th><th>Segment</th><th>CA</th><th>Risque</th><th>Satisfaction</th></tr></thead>
            <tbody>${fd.map(r=>`<tr>
              <td style="font-weight:500;">${r.nom||r.id}</td>
              <td><span class="badge ${r.segment==='Premium'?'badge-purple':r.segment==='VIP'?'badge-teal':r.segment==='Standard'?'badge-blue':'badge-gray'}">${r.segment||'—'}</span></td>
              <td style="font-family:sans-serif;">${r.ca?parseInt(r.ca).toLocaleString('fr-FR')+' €':'<span style="color:var(--text3)">—</span>'}</td>
              <td><span class="badge ${r.risque==='Critique'?'badge-red':r.risque==='Élevé'?'badge-red':r.risque==='Moyen'?'badge-amber':'badge-green'}">${r.risque||'—'}</span></td>
              <td style="font-family:sans-serif;">${r.satisfaction||'<span style="color:var(--text3)">—</span>'}</td>
            </tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>`;
    
    window._dashFilter = (type, val) => {
      if (type==='seg') filterSeg=val;
      else filterRisk=val;
      render();
    };
  }
  
  window._dashFilter = (type, val) => {
    if (type==='seg') filterSeg=val;
    else filterRisk=val;
    render();
  };
  
  render();
}
