function toggleRole() {
  state.role = state.role === 'admin' ? 'user' : 'admin';
  document.getElementById('current-role-display').textContent = state.role === 'admin' ? 'Admin' : 'Utilisateur';
  showToast(`Rôle changé : ${state.role==='admin'?'Administrateur':'Utilisateur'}`, 'info');
  addLog(`Changement de rôle → ${state.role}`); // US-20 (Traçabilité) couplée ici
  navigate(state.currentView); // Force le rafraîchissement de la vue pour appliquer les restrictions
}