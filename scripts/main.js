const SEGMENTS = ['Premium','Standard','Basic','VIP'];
const RISK_LEVELS = ['Faible','Moyen','Élevé','Critique'];
const ACTIONS_TYPES = ['Relancer','Fidéliser','Surveiller'];
const STATUS_CYCLE = ['À faire','En cours','Terminée'];
const STATUS_COLORS = {'À faire':'badge-gray','En cours':'badge-amber','Terminée':'badge-green'};

let state = {
  role: 'admin',
  data: [],
  headers: [],
  actions: [],
  logs: [],
  currentView: 'import',
};

function generateSampleData() {
  const noms = ['Dubois Martin','Leroy Sophie','Moreau Paul','Simon Claire','Laurent Thomas','Garcia Marie','Petit Jean','Bernard Alice','Robert Lucas','Richard Emma','Leclerc Hugo','Dupont Camille','Blanchard Noa','Fontaine Léa','Girard Antoine','Durand Isabelle','Mercier Noah','Rousseau Jade','Vincent Mathis','Lecomte Chloé'];
  const rows = [];
  for (let i=0; i<20; i++) {
    const seg = SEGMENTS[Math.floor(Math.random()*SEGMENTS.length)];
    const risk = RISK_LEVELS[Math.floor(Math.random()*RISK_LEVELS.length)];
    const ca = Math.round((Math.random()*50000+2000)/100)*100;
    const anciennete = Math.floor(Math.random()*10)+1;
    const satisfaction = Math.floor(Math.random()*5)+1;
    const has_missing = Math.random() > 0.85;
    rows.push({
      id: i+1,
      nom: noms[i],
      segment: seg,
      ca: has_missing ? '' : ca,
      anciennete,
      satisfaction: has_missing ? '' : satisfaction,
      risque: risk,
      email: `${noms[i].toLowerCase().replace(' ','.')}@example.com`,
    });
  }
  return { headers: ['id','nom','segment','ca','anciennete','satisfaction','risque','email'], rows };
}

function riskReco(client) {
  const r = client.risque;
  if (r === 'Critique') return { type: 'Relancer', action: 'Relancer en urgence', justif: `Risque critique détecté — CA ${client.ca ? '€'+client.ca : 'inconnu'}, satisfaction ${client.satisfaction||'?'}/5. Appel prioritaire recommandé sous 48h.` };
  if (r === 'Élevé') return { type: 'Surveiller', action: 'Mettre sous surveillance', justif: `Risque élevé sur segment ${client.segment}. Ancienneté ${client.anciennete} an(s). Prévoir un point mensuel.` };
  if (r === 'Moyen') return { type: 'Fidéliser', action: 'Proposer une offre fidélité', justif: `Risque modéré. Client segment ${client.segment} depuis ${client.anciennete} an(s). Un geste commercial peut prévenir le churn.` };
  return { type: 'Fidéliser', action: 'Maintenir la relation', justif: `Client à faible risque, fidélisation préventive conseillée.` };
}

function addLog(msg, user) {
  state.logs.unshift({ time: new Date(), msg, user: user || (state.role==='admin'?'Admin':'Utilisateur') });
  if (state.logs.length > 50) state.logs.pop();
}

function showToast(msg, type='info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `show ${type}`;
  setTimeout(()=>{ t.className=''; }, 3500);
}

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

document.getElementById('modal-overlay').addEventListener('click', e=>{ if(e.target===document.getElementById('modal-overlay')) closeModal(); });

function toggleRole() {
  state.role = state.role === 'admin' ? 'user' : 'admin';
  document.getElementById('current-role-display').textContent = state.role === 'admin' ? 'Admin' : 'Utilisateur';
  showToast(`Rôle changé : ${state.role==='admin'?'Administrateur':'Utilisateur'}`, 'info');
  addLog(`Changement de rôle → ${state.role}`);
  navigate(state.currentView);
}

function navigate(view) {
  state.currentView = view;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const items = document.querySelectorAll('.nav-item');
  const map = { import:0, apercu:1, dashboard:2, recos:3, actions:4, journal:5, securite:6 };
  if (items[map[view]]) items[map[view]].classList.add('active');
  const titles = { import:'Import CSV', apercu:'Aperçu des données', dashboard:'Dashboard', recos:'Recommandations', actions:'Gestion des actions', journal:'Journal de traçabilité', securite:'Sécurité & Contrôle d\'accès' };
  document.getElementById('page-title').textContent = titles[view] || view;
  const c = document.getElementById('content');
  c.innerHTML = '';
  if (view==='import') renderImport(c);
  else if (view==='apercu') renderApercu(c);
  else if (view==='dashboard') renderDashboard(c);
  else if (view==='recos') renderRecos(c);
  else if (view==='actions') renderActions(c);
  else if (view==='journal') renderJournal(c);
  else if (view==='securite') renderSecurite(c);
}

/* ============ IMPORT ============ */
function renderImport(c) {
  c.innerHTML = `
    <div style="max-width:600px;margin:0 auto;">
      <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()">
        <div class="upload-icon">⬆</div>
        <div class="upload-title">Importer un fichier CSV</div>
        <div class="upload-sub" style="margin-bottom:16px;">Glissez-déposez ou cliquez pour sélectionner</div>
        <div class="upload-sub">Format attendu : colonnes séparées par virgule ou point-virgule</div>
        <input type="file" id="file-input" accept=".csv,.txt" style="display:none" onchange="handleFile(event)">
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;">
        <button class="btn" onclick="loadSampleData()">Charger données de démonstration</button>
      </div>
      ${state.data.length ? `<div style="margin-top:20px;" class="card"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:18px;">✓</span><div><div style="font-size:13px;font-weight:500;font-family:sans-serif;">${state.data.length} clients chargés</div><div style="font-size:11px;color:var(--text2);font-family:sans-serif;">${state.headers.join(', ')}</div></div></div></div>` : ''}
      <div style="margin-top:24px;" class="card">
        <div class="section-label" style="font-family:sans-serif;">Format CSV attendu</div>
        <div style="font-size:11px;color:var(--text2);font-family:monospace;background:var(--surface2);padding:12px;border-radius:var(--radius);line-height:1.8;">
          id,nom,segment,ca,anciennete,satisfaction,risque,email<br>
          1,Dupont Alice,Premium,15000,3,4,Moyen,dupont@example.com<br>
          2,Martin Paul,Basic,2500,1,,Critique,martin@example.com
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text2);font-family:sans-serif;">Les valeurs manquantes sont détectées automatiquement.</div>
      </div>
    </div>`;
  setupDragDrop();
}

function setupDragDrop() {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;
  zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', ()=>zone.classList.remove('drag'));
  zone.addEventListener('drop', e=>{ e.preventDefault(); zone.classList.remove('drag'); const f=e.dataTransfer.files[0]; if(f) processFile(f); });
}

function handleFile(e) { const f=e.target.files[0]; if(f) processFile(f); }

function loadSampleData() {
  const d = generateSampleData();
  state.headers = d.headers;
  state.data = d.rows;
  document.getElementById('data-status').textContent = `${state.data.length} clients chargés`;
  addLog(`Données de démonstration chargées (${state.data.length} lignes)`);
  showToast(`${state.data.length} clients chargés avec succès`, 'success');
  navigate('import');
}

function processFile(file) {
  if (!file.name.match(/\.(csv|txt)$/i)) {
    showToast('Erreur : format non supporté. Utilisez un fichier .csv', 'error');
    addLog(`Import échoué : fichier ${file.name} invalide`);
    return;
  }
  if (file.size > 5*1024*1024) {
    showToast('Erreur : fichier trop volumineux (max 5 Mo)', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const sep = text.indexOf(';') > text.indexOf(',') ? ';' : ',';
      const lines = text.trim().split(/\r?\n/).filter(l=>l.trim());
      if (lines.length < 2) throw new Error('Fichier vide ou sans données');
      const headers = lines[0].split(sep).map(h=>h.trim().replace(/^"|"$/g,''));
      const rows = lines.slice(1).map((line,i)=>{
        const vals = line.split(sep).map(v=>v.trim().replace(/^"|"$/g,''));
        const obj = { id: i+1 };
        headers.forEach((h,j)=>{ obj[h] = vals[j] || ''; });
        return obj;
      });
      state.headers = headers;
      state.data = rows;
      document.getElementById('data-status').textContent = `${rows.length} clients chargés`;
      addLog(`Fichier CSV importé : ${file.name} (${rows.length} lignes, ${headers.length} colonnes)`);
      showToast(`Import réussi — ${rows.length} lignes chargées`, 'success');
      navigate('import');
    } catch(err) {
      showToast(`Erreur de lecture : ${err.message}`, 'error');
      addLog(`Import échoué : ${err.message}`);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

/* ============ APERCU ============ */
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

function createActionFromReco(client, type, action) {
  openModal(`
    <div class="modal-header">
      <div class="modal-title">Créer une action</div>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="form-group"><div class="form-label">Client</div><input class="form-input" value="${client.nom||'Client '+client.id}" readonly></div>
    <div class="form-group"><div class="form-label">Type d'action</div>
      <select class="form-input" id="m-type">
        ${ACTIONS_TYPES.map(t=>`<option ${t===type?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><div class="form-label">Description</div><input class="form-input" id="m-desc" value="${action}"></div>
    <div class="form-group"><div class="form-label">Statut initial</div>
      <select class="form-input" id="m-status">
        ${STATUS_CYCLE.map(s=>`<option>${s}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
      <button class="btn" onclick="closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="saveAction('${(client.nom||'Client '+client.id).replace(/'/g,'')}')">Créer l'action</button>
    </div>
  `);
}

function saveAction(clientName) {
  const type = document.getElementById('m-type').value;
  const desc = document.getElementById('m-desc').value;
  const status = document.getElementById('m-status').value;
  if (!desc.trim()) { showToast('La description est obligatoire', 'error'); return; }
  const action = { id: Date.now(), client: clientName, type, description: desc, status, createdAt: new Date() };
  state.actions.push(action);
  addLog(`Action créée : "${desc}" pour ${clientName}`);
  closeModal();
  showToast('Action créée avec succès', 'success');
}

/* ============ ACTIONS ============ */
function renderActions(c) {
  function render() {
    c.innerHTML = `
      <div class="gap-16">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-family:sans-serif;font-size:13px;color:var(--text2);">${state.actions.length} action(s) au total</div>
          <button class="btn btn-primary" onclick="openNewActionModal()">+ Nouvelle action</button>
        </div>
        ${state.actions.length===0?`<div class="empty">Aucune action créée. Allez dans les <span style="color:var(--blue);cursor:pointer" onclick="navigate('recos')">Recommandations</span> pour en générer.</div>`:`
        <div class="card">
          <div class="table-wrap"><table>
            <thead><tr><th>Client</th><th>Type</th><th>Description</th><th>Statut</th><th>Action</th></tr></thead>
            <tbody>${state.actions.map(a=>`<tr>
              <td style="font-weight:500;">${a.client}</td>
              <td><span class="action-type-tag ${a.type==='Relancer'?'relancer':a.type==='Fidéliser'?'fideliser':'surveiller'}">${a.type}</span></td>
              <td style="font-family:sans-serif;font-size:12px;">${a.description}</td>
              <td><span class="badge ${STATUS_COLORS[a.status]}">${a.status}</span></td>
              <td>
                <button class="status-btn" onclick="cycleStatus(${a.id})">→ ${STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status)+1)%3]}</button>
              </td>
            </tr>`).join('')}</tbody>
          </table></div>
        </div>`}
      </div>`;
    window._actionsRender = render;
  }
  
  window.cycleStatus = (id) => {
    const a = state.actions.find(x=>x.id===id);
    if (!a) return;
    const prev = a.status;
    a.status = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status)+1)%3];
    addLog(`Statut modifié : "${a.description}" → ${a.status}`);
    showToast(`Statut mis à jour : ${a.status}`, 'info');
    render();
  };
  
  window.openNewActionModal = () => {
    openModal(`
      <div class="modal-header">
        <div class="modal-title">Nouvelle action</div>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div class="form-group"><div class="form-label">Client</div><input class="form-input" id="m-client" placeholder="Nom du client"></div>
      <div class="form-group"><div class="form-label">Type</div>
        <select class="form-input" id="m-type">${ACTIONS_TYPES.map(t=>`<option>${t}</option>`).join('')}</select>
      </div>
      <div class="form-group"><div class="form-label">Description</div><input class="form-input" id="m-desc" placeholder="Description de l'action"></div>
      <div class="form-group"><div class="form-label">Statut</div>
        <select class="form-input" id="m-status">${STATUS_CYCLE.map(s=>`<option>${s}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        <button class="btn" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="saveActionManual()">Créer</button>
      </div>
    `);
  };
  
  window.saveActionManual = () => {
    const client = document.getElementById('m-client').value.trim();
    const type = document.getElementById('m-type').value;
    const desc = document.getElementById('m-desc').value.trim();
    const status = document.getElementById('m-status').value;
    if (!client||!desc) { showToast('Client et description obligatoires', 'error'); return; }
    state.actions.push({ id: Date.now(), client, type, description: desc, status, createdAt: new Date() });
    addLog(`Action manuelle créée : "${desc}" pour ${client}`);
    closeModal();
    showToast('Action créée', 'success');
    render();
  };
  
  render();
}

/* ============ SECURITE ============ */
function renderSecurite(c) {
  if (state.role !== 'admin') {
    c.innerHTML = `<div class="access-denied"><div class="access-icon">⊘</div><div class="access-title">Accès refusé</div><div class="access-msg">Cette section est réservée aux administrateurs.<br>Votre rôle actuel : <strong>Utilisateur</strong>.</div></div>`;
    return;
  }
  const missingCount = state.data.reduce((acc,r)=>acc+state.headers.filter(h=>r[h]===''||r[h]===null).length, 0);
  c.innerHTML = `
    <div class="gap-16">
      <div class="grid-2">
        <div class="card">
          <div class="section-label" style="font-family:sans-serif;">Gestion des rôles</div>
          <div class="table-wrap"><table>
            <thead><tr><th>Rôle</th><th>Accès</th><th>Import</th><th>Admin</th></tr></thead>
            <tbody>
              <tr><td><span class="badge badge-purple">Admin</span></td><td>✓ Tout</td><td>✓</td><td>✓</td></tr>
              <tr><td><span class="badge badge-gray">User</span></td><td>Lecture + Actions</td><td>✓</td><td>✗</td></tr>
            </tbody>
          </table></div>
          <div style="margin-top:12px;"><button class="btn" onclick="toggleRole()">Basculer vers rôle User (test)</button></div>
        </div>
        <div class="card">
          <div class="section-label" style="font-family:sans-serif;">Contrôle des imports</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;font-family:sans-serif;">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border);">
              <span>Fichiers acceptés</span><span style="color:var(--green-text);">.csv, .txt uniquement</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border);">
              <span>Taille max</span><span style="color:var(--text2);">5 Mo</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--border);">
              <span>Données chargées</span><span style="font-weight:500;">${state.data.length} lignes</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;">
              <span>Valeurs manquantes</span><span style="color:${missingCount>0?'var(--amber-text)':'var(--green-text)'};">${missingCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="section-label" style="font-family:sans-serif;">Politique de sécurité</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          ${[['Authentification','Rôles admin/user distincts','badge-purple'],['Import sécurisé','Validation type et taille','badge-green'],['Traçabilité','Journal complet des actions','badge-blue']].map(([t,d,b])=>`
            <div style="padding:12px;background:var(--surface2);border-radius:var(--radius);">
              <span class="badge ${b}" style="margin-bottom:8px;display:inline-flex;">${t}</span>
              <div style="font-size:11px;color:var(--text2);font-family:sans-serif;">${d}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

/* ============ JOURNAL ============ */
function renderJournal(c) {
  const colorMap = { 'Import':'badge-blue', 'Action':'badge-teal', 'Statut':'badge-amber', 'Rôle':'badge-purple', 'Données':'badge-green' };
  function tagLog(msg) {
    if (msg.includes('import')||msg.includes('Import')||msg.includes('CSV')) return 'Import';
    if (msg.includes('Action')||msg.includes('action')) return 'Action';
    if (msg.includes('Statut')||msg.includes('statut')) return 'Statut';
    if (msg.includes('rôle')||msg.includes('Rôle')||msg.includes('Changement')) return 'Rôle';
    return 'Données';
  }
  c.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div class="section-label" style="font-family:sans-serif;margin-bottom:0;">Historique des opérations</div>
        <span style="font-size:11px;color:var(--text2);font-family:sans-serif;">${state.logs.length} entrée(s)</span>
      </div>
      ${state.logs.length===0?`<div class="empty">Aucune opération enregistrée pour l'instant.</div>`:
        state.logs.map(l=>{
          const tag = tagLog(l.msg);
          const dotColors = {'Import':'var(--blue)','Action':'var(--teal)','Statut':'var(--amber)','Rôle':'var(--purple)','Données':'var(--green)'};
          return `<div class="log-item">
            <div class="dot" style="background:${dotColors[tag]||'var(--text3)'};"></div>
            <div style="flex:1;">
              <div class="log-msg">${l.msg}</div>
              <div class="log-user">${l.user} · ${l.time.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <span class="badge ${colorMap[tag]||'badge-gray'}">${tag}</span>
          </div>`;
        }).join('')}
    </div>`;
}

/* ============ INIT ============ */
addLog('Application démarrée');
navigate('import');