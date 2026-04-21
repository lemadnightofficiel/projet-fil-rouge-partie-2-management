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