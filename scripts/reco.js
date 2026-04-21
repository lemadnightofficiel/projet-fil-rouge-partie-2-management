/* ============ RECOMMANDATIONS ============ */
function renderRecos(c) {
  if (!state.data.length) { c.innerHTML=`<div class="empty">Aucune donnée chargée. <span style="color:var(--blue);cursor:pointer" onclick="navigate('import')">Importer un fichier →</span></div>`; return; }
  
  const risky = state.data.filter(r=>r.risque==='Élevé'||r.risque==='Critique'||r.risque==='Moyen');
  const typeIcons = { 'Relancer':'⟳', 'Fidéliser':'♡', 'Surveiller':'◎' };
  
  c.innerHTML = `
    <div class="gap-16">
      <div style="font-size:12px;color:var(--text2);font-family:sans-serif;padding:10px 14px;background:var(--blue-bg);border-radius:var(--radius);border:0.5px solid var(--blue-text);">
        ${risky.length} client(s) nécessitent une action. Les recommandations sont générées automatiquement selon le niveau de risque, le segment et les données disponibles.
      </div>
      ${risky.map(client=>{
        const reco = riskReco(client);
        return `<div class="reco-card">
          <div class="reco-header">
            <div>
              <div style="font-size:14px;font-weight:500;">${client.nom||'Client '+client.id}</div>
              <div style="font-size:11px;color:var(--text2);font-family:sans-serif;margin-top:2px;">Segment ${client.segment} · CA ${client.ca?parseInt(client.ca).toLocaleString('fr-FR')+' €':'inconnu'}</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
              <span class="badge ${client.risque==='Critique'?'badge-red':client.risque==='Élevé'?'badge-red':'badge-amber'}">${client.risque}</span>
              <span class="action-type-tag ${reco.type==='Relancer'?'relancer':reco.type==='Fidéliser'?'fideliser':'surveiller'}">${typeIcons[reco.type]} ${reco.type}</span>
            </div>
          </div>
          <div style="font-size:13px;font-weight:500;font-family:sans-serif;">${reco.action}</div>
          <div class="reco-justif">${reco.justif}</div>
          <div style="margin-top:10px;">
            <button class="btn" onclick="createActionFromReco(${JSON.stringify(client).replace(/"/g,'&quot;')}, '${reco.type}', '${reco.action.replace(/'/g,'')}')">
              + Créer une action
            </button>
          </div>
        </div>`;
      }).join('')}
      ${risky.length===0?`<div class="empty">Aucun client à risque détecté dans les données actuelles.</div>`:''}
    </div>`;
}