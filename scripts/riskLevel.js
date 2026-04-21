// Variable d'état pour le filtre (US-10)
let filterRisk = '';

// Logique de filtrage US-10
function filtered() {
  return state.data.filter(r => {
    if (filterRisk && r.risque !== filterRisk) return false; // Application du filtre
    return true;
  });
}

// Interface du filtre (Sélecteur HTML)
<select class="filter-select" id="f-risk" onchange="window._dashFilter('risk', this.value)">
  <option value="">Tous les niveaux de risque</option>
  ${RISK_LEVELS.map(r => `<option value="${r}" ${filterRisk === r ? 'selected' : ''}>${r}</option>`).join('')}
</select>