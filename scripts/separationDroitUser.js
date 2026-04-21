/* ============ SECURITE (US-17 & US-18) ============ */
function renderSecurite(c) {
  // Blocage de l'accès si le rôle n'est pas admin (US-17)
  if (state.role !== 'admin') {
    c.innerHTML = `
      <div class="access-denied">
        <div class="access-icon">⊘</div>
        <div class="access-title">Accès refusé</div>
        <div class="access-msg">
          Cette section est réservée aux administrateurs.<br>
          Votre rôle actuel : <strong>Utilisateur</strong>.
        </div>
      </div>`;
    return; // Arrêt du rendu ici pour protéger les données
  }

  // Si admin, affichage des contrôles critiques (US-18)
  c.innerHTML = `
    <div class="gap-16">
      <div class="grid-2">
        <div class="card">
          <div class="section-label">Gestion des rôles</div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Rôle</th><th>Accès</th><th>Admin</th></tr></thead>
              <tbody>
                <tr><td>Admin</td><td>✓ Tout</td><td>✓</td></tr>
                <tr><td>User</td><td>Lecture + Actions</td><td>✗</td></tr>
              </tbody>
            </table>
          </div>
          <button class="btn" onclick="toggleRole()">Basculer vers rôle User (test)</button>
        </div>
        </div>
    </div>`;
}