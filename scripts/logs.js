function addLog(msg, user) {
  state.logs.unshift({ time: new Date(), msg, user: user || (state.role==='admin'?'Admin':'Utilisateur') });
  if (state.logs.length > 50) state.logs.pop();
}