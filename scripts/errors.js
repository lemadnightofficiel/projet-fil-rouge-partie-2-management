if (!file.name.match(/\.(csv|txt)$/i)) {
  showToast('Erreur : format non supporté. Utilisez un fichier .csv', 'error');
  addLog(`Import échoué : fichier ${file.name} invalide`);
  return;
}

if (file.size > 5*1024*1024) {
  showToast('Erreur : fichier trop volumineux (max 5 Mo)', 'error');
  return;
}