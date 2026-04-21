// Extrait de renderRecos (Lignes 280-285 environ)
<div style="margin-top:10px;">
  <button class="btn" onclick="createActionFromReco(${JSON.stringify(client).replace(/"/g,'&quot;')}, '${reco.type}', '${reco.action.replace(/'/g,'')}')">
    + Créer une action
  </button>
</div>

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
  
  const action = { 
    id: Date.now(), 
    client: clientName, 
    type, 
    description: desc, 
    status, 
    createdAt: new Date() 
  };
  
  state.actions.push(action); // Ajout au state
  addLog(`Action créée : "${desc}" pour ${clientName}`); // US-20 (Traçabilité)
  closeModal();
  showToast('Action créée avec succès', 'success');
}