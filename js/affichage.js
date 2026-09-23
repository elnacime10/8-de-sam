/* Le 8 de SAM — js/affichage.js
   Animations et dessin de la table. */

/* ============================================================
   5 · ANIMATIONS
   ============================================================ */
function rectOf(x){
  if (!x) return null;
  if (typeof x.getBoundingClientRect === 'function'){ const r = x.getBoundingClientRect(); return r.width ? r : null; }
  return x.width ? x : null;
}
function handTarget(){
  const h = $('#hand').getBoundingClientRect();
  const w = CW, ht = CH;
  return { left:h.left + h.width/2 - w/2, top:h.top + Math.max(0,(h.height-ht)/2), width:w, height:ht };
}
function fly(from, to, html, flip){
  return new Promise(resolve => {
    const layer = $('#flyLayer');
    const a = rectOf(from), b = rectOf(to);
    if (!a || !b || !layer){ resolve(); return; }
    const d = document.createElement('div');
    d.className = 'flyer';
    d.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;`;
    d.innerHTML = html;
    layer.appendChild(d);
    const dx = b.left + (b.width-a.width)/2 - a.left;
    const dy = b.top + (b.height-a.height)/2 - a.top;
    const sc = Math.min(1.15, b.width / a.width);   /* une carte qui vole garde sa taille */
    const ms = S(CONFIG.flyMs);
    requestAnimationFrame(() => {
      d.style.transition = `transform ${ms}ms cubic-bezier(.22,.75,.3,1)`;
      d.style.transform = `translate(${dx}px,${dy}px) scale(${sc})` + (flip ? ' rotateY(360deg)' : '');
    });
    setTimeout(() => { d.remove(); resolve(); }, ms + 30);
  });
}
async function flyCards(cards, to, faceUp){
  const n = Math.min(cards.length, 5);
  for (let i = 0; i < n; i++){
    fly($('#drawSlot'), to, faceUp ? cardHTML(cards[i]) : '<div class="cardback" style="width:100%;height:100%"></div>', faceUp);
    await sleep(S(150));
  }
  await sleep(Math.max(0, S(CONFIG.flyMs) - S(150)) + (faceUp ? S(CONFIG.drawHoldMs) : 0));
}
const handEl = i => document.querySelector(`#hand .card[data-i="${i}"]`);
const oppStackEl = p => document.querySelector(`.seat[data-p="${p}"] .opp`) || $('#drawSlot');

/* ============================================================
   6 · RENDU
   ============================================================ */
let flashT = null, lastDir = null;
let lastBubbleMove = -9, lastBubbleWho = -1;

function lineFor(p, kind){
  const set = LINES[SG(p).char];
  if (!set || !set[kind] || !set[kind].length) return null;
  const l = set[kind][Math.floor(Math.random() * set[kind].length)];
  return SET.trash ? l.t : l.c;
}
/* Une bulle à la fois, jamais deux fois de suite le même, et pas à chaque coup. */
/* ---- LE FIL : un seul endroit où tout s'écrit, coups et répliques ----
   Plus de bulle posée sur un portrait, plus de bandeau séparé, plus de
   minuterie d'effacement : le fil défile, c'est tout. */
const FIL = [];
function filAjoute(p, texte, genre){
  const d = FIL[FIL.length - 1];
  if (d && d.p === p && d.texte === texte && d.genre === genre) return;   /* pas deux fois la même ligne */
  FIL.push({ p, texte, genre, n:(G ? G.actNo : 0) });
  if (FIL.length > 12) FIL.shift();
  renderFil();
}
function renderFil(){
  const el = $('#fil'); if (!el) return;
  const max = +(el.dataset.lignes || 3);
  const vues = FIL.slice(-max);
  el.innerHTML = vues.map((l, i) => {
    const age = vues.length - 1 - i;                    /* 0 = la plus récente */
    const moi = l.p === ME;
    const qui = moi ? 'Toi' : nameOf(l.p);
    const corps = l.genre === 'dit' ? `<i>«&nbsp;${l.texte}&nbsp;»</i>` : l.texte;
    return `<div class="fl a${age}${moi ? ' moi' : ''}"><span class="q">${qui}</span>${corps}</div>`;
  }).join('');
}
/* les répliques des personnages passent par le fil */
function bubble(p, kind){
  if (p === ME || !G || skipAll) return;
  if (G.over && kind !== 'out' && kind !== 'lose') return;
  const fin = (kind === 'out' || kind === 'lose');
  if (!fin && G.moveNo - lastBubbleMove < CONFIG.bubbleGap) return;
  if (!fin && MATCH.n > 2 && p === lastBubbleWho) return;
  const txt = lineFor(p, kind);
  if (!txt) return;
  lastBubbleMove = G.moveNo; lastBubbleWho = p;
  filAjoute(p, txt, 'dit');
  SFX.bub && SFX.bub();
}
function flash(txt, hot){
  const el = $('#flash');
  el.textContent = txt;
  el.classList.toggle('hot', !!hot);
  el.classList.add('show');
  clearTimeout(flashT);
  flashT = setTimeout(() => el.classList.remove('show'), S(1500));
}

/* Un signe unique par carte, identique à celui du panneau des règles.
   Le valet et le 7 changent de signe selon le mode réellement en cours. */
function signOf(r){
  const d = !G || duel();
  if (r === 'A') return '+2';
  if (r === '9') return '=9';
  if (r === '8') return '?';
  if (r === '10') return '↻';
  if (r === '7') return d ? '↻' : '↷';
  if (r === 'V') return d ? '↻' : '⇄';
  return '';
}

function cardHTML(c, extra, idx){
  const cls = ['card'];
  if (isRed(c.s)) cls.push('red');
  if (c.r === 'A') cls.push('sp-A');
  else if (c.r === '9') cls.push('sp-9');
  else if (c.r === '8') cls.push('sp-8');
  else if (isChain(c.r)) cls.push('sp-c');
  if (extra) cls.push(extra);
  const ch = SUIT_CHAR[c.s];
  const sg = signOf(c.r);
  return `<div class="${cls.join(' ')}"${idx !== undefined ? ` data-i="${idx}"` : ''}>
    ${sg ? `<span class="sign">${sg}</span>` : ''}
    <span class="corner tl"><span class="rk">${c.r}</span><span class="st">${ch}</span></span>
    <span class="pip">${ch}</span>
    <span class="corner br"><span class="rk">${c.r}</span><span class="st">${ch}</span></span>
  </div>`;
}

function sortHand(){
  const o = sortMode === 'suit'
    ? (a,b) => (SUITS.indexOf(a.s)-SUITS.indexOf(b.s)) || (RANKS.indexOf(a.r)-RANKS.indexOf(b.r))
    : (a,b) => (RANKS.indexOf(a.r)-RANKS.indexOf(b.r)) || (SUITS.indexOf(a.s)-SUITS.indexOf(b.s));
  G.hands[ME].sort(o);
}

/* les adversaires dans l'ordre de jeu à partir de moi, répartis gauche puis droite */
function oppOrder(){
  const out = [];
  for (let k = 1; k < MATCH.n; k++) out.push((ME + k) % MATCH.n);
  return out;
}
function renderOpps(){
  const row = $('#oppRow');
  const n = MATCH.n - 1;
  row.className = n >= 2 ? 'two' : 'solo';
  row.dataset.n = n;
  row.innerHTML = '';
  oppOrder().forEach(p => {
    const aim = G.pending && G.pending.target === p;
    const mine = G.turn === p && !G.over;
    const derniere = G.in[p] && G.hands[p].length === 1 && !G.over;   /* le moment où tout se joue */
    const seat = document.createElement('div');
    seat.className = 'seat' + (G.in[p] ? '' : ' out') + (aim ? ' aim' : (mine ? ' turn' : ' dim')) + (derniere ? ' last' : '');
    seat.dataset.p = p;
    const tag = aim ? `<span class="tagS aimT">▼ +${G.pending.amount}</span>`
              : derniere ? '<span class="tagS lastT">DERNIÈRE CARTE</span>'
              : mine ? '<span class="tagS turnT">IL JOUE</span>' : '';
    const nb = G.hands[p].length;
    const niveau = SG(p).human ? 'joueur' : SG(p).level;
    const score = MATCH.n > 2 ? ' · <b>' + (SG(p).score > 0 ? '+' : '') + SG(p).score + '</b>' : '';
    seat.innerHTML = `
      <div class="opp${mine ? ' turn' : ''}${aim ? ' aim' : ''}">
        ${tag}
        <img class="face" src="${faceOf(p)}" alt="">
        <div class="who"><div class="nm">${nameOf(p)}</div><div class="mt">${niveau}${score}</div></div>
        <div class="cntBox"><span class="cnt">${G.in[p] ? nb : '✓'}</span><span class="cntL">${G.in[p] ? (nb > 1 ? 'cartes' : 'carte') : 'sorti'}</span></div>
      </div>`;
    row.appendChild(seat);
  });
}

function renderHist(){
  const el = $('#histCol');
  el.innerHTML = G.hist.map((h, i) =>
    `<div class="chip ${isRed(h.s) ? 'r' : ''} f${Math.max(0, i-2)}"><u>${h.n}</u>${h.r}${SUIT_CHAR[h.s]}</div>`
  ).join('');
}

function render(){
  if (!G) return;
  sortHand();
  $('#matchTitle').textContent = (MATCH.n === 2 ? 'Face à face' : 'Partie à ' + MATCH.n)
    + (MATCH.online ? ' · en ligne' : '');
  $('#matchSub').textContent = MATCH.n > 2
    ? `Tour ${MATCH.tour}/${MATCH.tours} · toi ${SG(ME).score > 0 ? '+' : ''}${SG(ME).score}`
    : 'Manche sèche';
  const wd = WORLDS[MATCH.world] || WORLDS.quartier;
  document.documentElement.dataset.world = MATCH.world;      /* habillage du fil */
  $('#bgImg').style.backgroundImage = 'url(' + IMG[MATCH.world] + ')';
  $('#bgFar').style.backgroundImage = 'url(' + IMG[MATCH.world] + ')';
  document.documentElement.style.setProperty('--bgY', wd.bgY);
  document.documentElement.style.setProperty('--drop', wd.drop + 'px');
  $('#meFace').src = faceOf(ME);
  renderOpps();
  renderHist();

  $('#drawCount').textContent = G.deck.length;
  const ds = $('#discardSlot');
  if (G.top){
    ds.classList.remove('empty');
    const under = G.discard.slice(Math.max(0, G.discard.length - 3), G.discard.length - 1);
    let html = '';
    under.forEach((c, i) => {
      const rot = (i % 2 ? 1 : -1) * (5 - i * 1.5);
      html += `<div class="under" style="position:absolute;inset:0;transform:rotate(${rot}deg)">${cardHTML(c)}</div>`;
    });
    ds.innerHTML = html + cardHTML(G.top);
  }
  else { ds.classList.add('empty'); ds.innerHTML = ''; }
  const tag = $('#suitTag');
  if (G.activeSuit){
    const col = SUIT_COL[G.activeSuit];
    tag.className = '';
    tag.style.setProperty('--sc', col);
    ds.style.setProperty('--sc', col);
    tag.innerHTML = '<b>' + SUIT_CHAR[G.activeSuit] + '</b><span>' + SUIT_NAME[G.activeSuit] + '</span>';
  } else {
    tag.className = 'none';
    ds.style.setProperty('--sc', 'transparent');
    tag.innerHTML = '<b>—</b><span>couleur</span>';
  }

  const dw = $('#dirWrap');
  dw.style.display = MATCH.n > 2 ? 'flex' : 'none';
  const ar = $('#dirArrow');
  ar.textContent = G.dir === 1 ? '↻' : '↺';
  if (lastDir !== null && lastDir !== G.dir){
    ar.classList.remove('flip'); void ar.offsetWidth; ar.classList.add('flip');
    setTimeout(() => ar.classList.remove('flip'), 500);
  }
  lastDir = G.dir;
  $('#dirTxt').textContent = G.pending
    ? (G.pending.target === ME ? 'sur toi' : 'sur ' + nameOf(G.pending.target))
    : (G.dir === 1 ? 'sens horaire' : 'sens inversé');

  const hand = $('#hand'), cards = G.hands[ME];
  hand.innerHTML = '';
  $('#handCount').textContent = cards.length + (cards.length > 1 ? ' cartes' : ' carte');
  const cw = CW, avail = Math.max(120, hand.clientWidth - 8);
  const nRows = cards.length > 24 ? 3 : (cards.length > 11 ? 2 : 1);   /* deux étages suffisent jusqu'à 24 cartes */
  const lift = Math.round(CH * 0.5);
  hand.style.height = (CH + 24 + (nRows - 1) * lift) + 'px';
  const per = Math.ceil(cards.length / nRows), rows = [];
  for (let k = 0; k < cards.length; k += per) rows.push(cards.slice(k, k + per));
  let idx = 0;
  const myTurn = G.turn === ME && G.in[ME] && !G.over && !busy;
  rows.forEach((row, r) => {
    let step = cw + 5;
    /* on resserre autant qu'il faut : la main ne sort jamais de l'écran */
    if (row.length > 1 && cw + (row.length-1)*step > avail) step = Math.max(12, (avail - cw)/(row.length-1));
    const total = cw + (row.length-1)*step;
    const x0 = Math.max(4, (hand.clientWidth - total)/2);
    const mid = (row.length-1)/2;
    row.forEach((c, k) => {
      const i = idx++;
      const box = document.createElement('div');
      box.innerHTML = cardHTML(c, '', i);
      const el = box.firstElementChild;
      const rot = row.length > 1 ? (k - mid) * 1.7 : 0;
      el.style.left = (x0 + k*step) + 'px';
      el.style.bottom = ((rows.length - 1 - r) * lift) + 'px';
      el.style.zIndex = r*100 + k;
      el.style.setProperty('--t', `rotate(${rot}deg) translateY(${Math.abs(k-mid)*1.3}px)`);
      if (i === selected) el.classList.add('sel');
      el.addEventListener('click', ev => { ev.stopPropagation(); onCardClick(i, el); });
      hand.appendChild(el);
    });
  });

  $('#handZone').classList.toggle('mine', myTurn);
  $('#turnBanner').classList.toggle('hidden', !myTurn);
  $('#deckInfo').textContent = 'pioche ' + G.deck.length;
  renderAct();
  renderSuitBig();
  const btn = $('#drawBtn');
  btn.disabled = !myTurn;
  if (G.pending && myTurn){
    btn.innerHTML = '⚠ PRENDRE <span class="big">' + G.pending.amount + '</span> CARTE' + (G.pending.amount > 1 ? 'S' : '');
    btn.classList.add('danger');
  } else {
    btn.textContent = myTurn && hasPlayable(ME) ? 'Piocher quand même' : 'Piocher';
    btn.classList.remove('danger');
    btn.classList.toggle('prime', myTurn && !hasPlayable(ME));   /* doré seulement quand il faut piocher */
  }
  const showSkip = !G.in[ME] && !G.over;
  $('#skipBtn').classList.toggle('hidden', !showSkip);
  $('#handZone').style.opacity = G.in[ME] ? '1' : '.45';
  setTurnLine();
  ajusteTable();
}

function setTurnLine(){
  const el = $('#turnLine');
  if (!G || G.over){ el.textContent = ''; el.className = ''; return; }
  if (!G.in[ME]){ el.className = ''; el.textContent = 'Tu es sorti — ils se départagent'; return; }
  if (G.turn === ME){
    el.className = 'you';
    if (G.pending) el.textContent = 'Contre avec un ' + (G.pending.type === 'A' ? 'as' : '9') + ' ou encaisse ' + G.pending.amount;
    else if (G.freeStart) el.textContent = 'Tu ouvres : pose la carte que tu veux';
    else el.textContent = hasPlayable(ME) ? '' : 'Rien à poser : pioche';   /* « À toi » : le bandeau suffit */
  } else { el.className = ''; el.textContent = nameOf(G.turn) + (busy ? ' joue…' : ' réfléchit…'); }
}


/* ---- Ce qu'a fait le joueur précédent, écrit en clair ---- */
let lastActShown = 0;
/* Le fil n'est pas un journal de toutes les cartes : l'historique est là pour ça.
   Il ne garde que ce qui se raconte : attaques, encaissements, tours sautés,
   changements de sens, dernières cartes et sorties. */
function renderAct(){
  const a = G && G.lastAct;
  if (!a || a.n === lastActShown) return;
  lastActShown = a.n;
  const gras = t => '<b>' + t + '</b>';
  let t = null;
  if (a.k === 'take') t = 'encaisse ' + gras((a.amt || 1) + ' carte' + ((a.amt || 1) > 1 ? 's' : ''));
  else if (a.k === 'play'){
    if (a.amt && (a.r === 'A' || a.r === '9')) t = 'attaque ' + gras('+' + a.amt);
    else if (a.skip !== undefined) t = (a.skip === ME ? 'te fait sauter ton tour' : 'fait sauter ' + nameOf(a.skip));
    else if (a.rev) t = 'inverse le sens';
  }
  if (t) filAjoute(a.p, t, 'coup');
}

/* ---- La couleur demandée par un 8 recouvre la carte, et teinte la table ---- */
/* symboles dessinés (pleins, nets, sans rien qui transparaisse) */
const SUIT_SVG = {
  H:'M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56Z',
  D:'M50 6 86 50 50 94 14 50Z',
  S:'M50 6C30 30 8 42 8 60c0 14 12 22 24 22 8 0 13-4 16-8-2 10-6 16-12 20h28c-6-4-10-10-12-20 3 4 8 8 16 8 12 0 24-8 24-22C92 42 70 30 50 6Z',
  C:'M50 8a17 17 0 1 1 0 34 17 17 0 1 1 0-34ZM28 36a17 17 0 1 1 0 34 17 17 0 1 1 0-34ZM72 36a17 17 0 1 1 0 34 17 17 0 1 1 0-34ZM46 52h8l6 42H40Z'
};
function renderSuitBig(){
  const el = $('#suitBig'), ds = $('#discardSlot'), tab = $('#table');
  const demande = G && G.top && G.top.r === '8' && G.activeSuit;
  ds.classList.toggle('masque', !!demande);
  if (!demande){ el.classList.add('hidden'); el.dataset.s = ''; tab.style.setProperty('--tint', 'transparent'); return; }
  const col = SUIT_COL[G.activeSuit];
  if (el.dataset.s !== G.activeSuit || el.classList.contains('hidden')){
    el.dataset.s = G.activeSuit;
    el.innerHTML = '<svg viewBox="0 0 100 100" width="58%" height="58%" aria-hidden="true"><path fill="#fff" d="' + SUIT_SVG[G.activeSuit] + '"/></svg>';
    el.style.background = col;
    el.classList.remove('hidden');
  }
  tab.style.setProperty('--tint', col + '40');
}

/* ---- La table prend la hauteur qui reste : rien ne déborde, rien ne défile ----
   On rapetisse la pioche et la défausse jusqu'à ce que tout tienne. En dernier
   recours on masque l'historique, puis le sens de rotation. */
function ajusteTable(){
  try { ajusteTableSur(); } catch(e){ /* une mesure ratée ne doit jamais empêcher la partie de s'afficher */ }
}
function ajusteTableSur(){
  const t = $('#table'); if (!t || !t.children || typeof getComputedStyle !== 'function') return;
  const r = document.documentElement.style;
  const besoin = () => {
    let h = 0, n = 0;
    for (const e of Array.from(t.children)){
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.position === 'absolute') continue;
      h += e.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0); n++;
    }
    return h + Math.max(0, n - 1) * (parseFloat(getComputedStyle(t).rowGap) || 0);
  };
  const pose = w => { r.setProperty('--pile-w', w + 'px'); r.setProperty('--pile-h', Math.round(w * 1.4) + 'px'); };
  $('#histCol').style.display = '';
  $('#hand').style.transform = '';
  t.classList.remove('serre');
  let pw = PW0; pose(pw);
  /* on ne calcule plus : on regarde si quelque chose sort vraiment de la table */
  const trop = () => {
    const r = t.getBoundingClientRect(); let dehors = 0;
    for (const e of Array.from(t.children)){
      const cs2 = getComputedStyle(e);
      if (cs2.display === 'none' || cs2.position === 'absolute') continue;
      const b = e.getBoundingClientRect();
      dehors = Math.max(dehors, r.top - b.top, b.bottom - r.bottom);
    }
    return dehors > 1;
  };
  let garde = 0;
  while (trop() && pw > 48 && garde++ < 20){ pw -= 6; pose(pw); }
  const fil = $('#fil');
  if (fil && fil.dataset.lignes !== '3'){ fil.dataset.lignes = 3; renderFil(); }
  if (trop()) t.classList.add('serre');    /* plus de place : on aligne en haut, jamais de coupe */
  if (trop() && fil){ fil.dataset.lignes = 2; renderFil(); }   /* le fil rétrécit avant tout le reste */
  if (trop() && fil){ fil.dataset.lignes = 1; renderFil(); }
  if (trop()) $('#dirWrap').style.display = 'none';
  if (trop()) $('#histCol').style.display = 'none';
  /* tout petit écran : la main se réduit un peu plutôt que de chevaucher la table */
  const hand = $('#hand'), manque = besoin() - t.clientHeight;
  if (manque > 0){
    const h = hand.offsetHeight, k = Math.max(0.72, (h - manque) / h);
    hand.style.transformOrigin = '50% 100%';
    hand.style.transform = 'scale(' + k.toFixed(3) + ')';
    hand.style.height = Math.round(h * k) + 'px';
  }
}
