const missing = state.data.filter(r=>state.headers.some(h=>r[h]===''||r[h]===null));
const missingCount = state.data.reduce((acc,r)=>acc+state.headers.filter(h=>r[h]===''||r[h]===null).length, 0);
// Affichage conditionnel si des erreurs sont détectées
{missingCount > 0 ? `... Problèmes de qualité détectés ...` : ''}