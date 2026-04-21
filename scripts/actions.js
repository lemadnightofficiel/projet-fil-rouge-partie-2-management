
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
