function renderApercu(c) {
  if (!state.data.length) { c.innerHTML=`<div class="empty">Aucune donnée chargée. <span style="color:var(--blue);cursor:pointer" onclick="navigate('import')">Importer un fichier →</span></div>`; return; }
  
  const missing = state.data.filter(r=>state.headers.some(h=>r[h]===''||r[h]===null||r[h]===undefined));
  const missingCount = state.data.reduce((acc,r)=>acc+state.headers.filter(h=>r[h]===''||r[h]===null).length, 0);
  
  c.innerHTML = `
    <div class="gap-16">
      <div class="metric-grid">
        <div class="metric-card"><div class="metric-label">Lignes importées</div><div class="metric-value">${state.data.length}</div></div>
        <div class="metric-card"><div class="metric-label">Colonnes</div><div class="metric-value">${state.headers.length}</div></div>
        <div class="metric-card"><div class="metric-label">Valeurs manquantes</div><div class="metric-value" style="color:${missingCount>0?'var(--amber)':'var(--green)'}">${missingCount}</div><div class="metric-sub">${missing.length} lignes concernées</div></div>
      </div>
      ${missingCount>0?`<div class="card" style="border-color:var(--amber)"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><span style="color:var(--amber);font-size:14px;">⚠</span><div class="section-label" style="font-family:sans-serif;margin-bottom:0;">Problèmes de qualité détectés</div></div><div class="table-wrap"><table><thead><tr>${state.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${missing.map(r=>`<tr>${state.headers.map(h=>`<td style="${r[h]===''||r[h]===null?'background:var(--amber-bg);color:var(--amber-text);':''}">${r[h]===''||r[h]===null?'—':r[h]}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`:''}
      <div class="card">
        <div class="section-label" style="font-family:sans-serif;">Toutes les données (${state.data.length} lignes)</div>
        <div class="table-wrap"><table><thead><tr>${state.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${state.data.slice(0,50).map(r=>`<tr>${state.headers.map(h=>`<td>${r[h]!==''&&r[h]!==null&&r[h]!==undefined?r[h]:'<span style="color:var(--text3)">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        ${state.data.length>50?`<div style="font-size:11px;color:var(--text2);font-family:sans-serif;margin-top:8px;">Affichage limité aux 50 premières lignes sur ${state.data.length}.</div>`:''}
      </div>
    </div>`;
}