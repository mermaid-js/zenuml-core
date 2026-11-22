/* ZML Ink: prototype layer over the real renderToSvg. Nothing here touches src/.
   gate      decides which text the renderer sees for this keystroke
   reconcile decides which elements are new, kept, renamed or gone
   Stage     paints: instant (arm A), full queued strokes (arm B), budgeted strokes (arm C) */
(function (root) {
  'use strict';

  const C = {
    EMA_ALPHA: 0.3, EMA_START: 180, EMA_MAX_GAP: 1200,
    K_TEMPO: 1.6, D_MIN: 110, D_MAX: 240, DEBT_CAP: 250,
    DWELL_K: 2.5, DWELL_MIN: 250, DWELL_MAX: 500,
    LOSS_HOLD: 1200,
    GLIDE: 110, EXIT: 90,
    BULK_MIN: 5, BATCH_TOTAL: 240, BATCH_EACH: 120, BATCH_MAX: 120,
    B_PARTICIPANT: [300, 300, 200], B_MESSAGE: [300, 100, 200],
  };

  // ---- edit location, from text alone ------------------------------------
  function locateEdit(prev, next) {
    let p = 0;
    const max = Math.min(prev.length, next.length);
    while (p < max && prev[p] === next[p]) p++;
    let s = 0;
    while (s < max - p && prev[prev.length - 1 - s] === next[next.length - 1 - s]) s++;
    const inserted = next.slice(p, next.length - s);
    const removed = prev.slice(p, prev.length - s);
    const caret = next.length - s;
    const line = next.slice(0, caret).split('\n').length - 1;
    const nl = (t) => (t.match(/\n/g) || []).length;
    return { line, inserted, removed, bulk: nl(inserted) >= 2 || nl(removed) >= 2 };
  }

  // ---- gate ---------------------------------------------------------------
  const LOOP_HEAD = /^(if|else\s+if|while|for|foreach|forEach|loop|section|frame|critical)\s*\(/;
  const BLOCK_BARE = /^(if|else|while|for|foreach|forEach|loop|section|frame|critical|opt|par|try|catch|finally|group|ref|new)$/;

  function closeParens(s) {
    let depth = 0, q = false;
    for (const ch of s) {
      if (ch === '"') q = !q;
      else if (!q && ch === '(') depth++;
      else if (!q && ch === ')') depth = Math.max(0, depth - 1);
    }
    let out = s;
    if (depth > 0) out = out.replace(/[\s,]+$/, '');
    return out + ')'.repeat(depth);
  }
  const oddQuotes = (s) => ((s.match(/"/g) || []).length) % 2 === 1;
  const parenDepth = (s) => {
    let d = 0, q = false;
    for (const ch of s) { if (ch === '"') q = !q; else if (!q && ch === '(') d++; else if (!q && ch === ')') d--; }
    return d;
  };
  const KEYWORDS = ['if', 'else', 'while', 'for', 'foreach', 'forEach', 'loop', 'section', 'frame', 'critical', 'opt', 'par', 'try', 'catch', 'finally', 'group', 'ref', 'new', 'return', 'title'];
  const keywordPrefix = (s) => s.length > 0 && KEYWORDS.some((k) => k !== s && k.startsWith(s));

  // Each class comes from the per-key trace. Returns the text the renderer gets.
  function gateLine(line, ctx) {
    const indent = (line.match(/^\s*/) || [''])[0];
    const s = line.trim();
    const pass = (t) => ({ text: indent + t, reason: null });
    const hold = (reason, t = '') => ctx.dwell && reason !== 'keyword' && reason !== 'string'
      ? { text: indent + closeParens(s), reason: null }
      : { text: t ? indent + t : '', reason };
    if (!s || s.startsWith('//')) return pass(s);
    if (oddQuotes(s)) {
      if (s.indexOf('"') > 0 && /[.(]/.test(s.slice(0, s.lastIndexOf('"')))) return pass(closeParens(s + '"'));
      return hold('string');
    }
    if (/^group\b/.test(s) && !/[{}]$/.test(s)) return hold('keyword');
    if (/^group\b/.test(s) && /\{.*[^}]$/.test(s)) return hold('keyword');
    if (keywordPrefix(s)) return hold('keyword');
    if (/^title\s/.test(s)) return pass(s);
    if (/^=/.test(s)) return /^==.*==$/.test(s) ? pass(s) : hold('divider');

    if (s[0] === '}') {
      const rest = s.slice(1).trim();
      if (!rest || /\{$/.test(rest)) return pass(s);
      if (/^(else\s+if|catch|section)\s*\(/.test(rest)) return pass('} ' + closeParens(rest) + ' {');
      if (/^(else|finally|catch)$/.test(rest)) return pass('} ' + rest + ' {');
      return { text: indent + '}', reason: 'keyword' };
    }
    if (LOOP_HEAD.test(s)) {
      const c = closeParens(s);
      return pass(/\{$/.test(c) ? c : c + ' {');
    }
    if (/^ref\s*\(/.test(s)) return pass(closeParens(s));
    if (BLOCK_BARE.test(s)) return hold('keyword');
    if (/=\s*$/.test(s) && parenDepth(s) <= 0) return hold('assign');

    const rhs = (s.match(/^(?:[\w$<>\[\],]+\s+)?[\w$]+\s*=\s*(.*)$/) || [])[1];
    const t = rhs !== undefined ? rhs : s;
    if (/^new(\s+[^\s(]*)?$/.test(t)) return hold('new-name');
    if (rhs !== undefined && /^[\w$]+$/.test(t)) return hold('bare');
    if (s === 'return') return hold('return');

    const arrow = t.match(/^(\S+?)\s*-(>?)\s*([^\s:.(]*)$/);
    if (arrow) {
      if (!arrow[2] || !arrow[3]) return hold('arrow');
      return ctx.names.has(arrow[3]) ? pass(closeParens(s)) : hold('target');
    }
    if (/[.({}:]/.test(s) || s.includes('->') || /^return\b/.test(s)) return pass(closeParens(s));
    return hold('bare');
  }

  function balanceBraces(lines, caretLine) {
    let depth = 0, lastOpen = -1;
    lines.forEach((l, i) => {
      let q = false;
      const code = l.replace(/^\s*\/\/.*$/, '');
      for (let k = 0; k < code.length; k++) {
        const ch = code[k];
        if (ch === '"') q = !q;
        else if (!q && ch === '{') { depth++; lastOpen = i; }
        else if (!q && ch === '}') depth--;
      }
    });
    if (depth <= 0) return lines;
    const at = Math.max(caretLine, lastOpen) + 1;
    return [...lines.slice(0, at), ...Array(depth).fill('}'), ...lines.slice(at)];
  }

  function gate(code, edit, ctx) {
    const lines = code.split('\n');
    let reason = null;
    if (!edit.bulk && edit.line < lines.length) {
      const g = gateLine(lines[edit.line], ctx);
      reason = g.reason;
      lines[edit.line] = g.text;
    }
    return { code: balanceBraces(lines, edit.line).join('\n'), reason };
  }

  // ---- tempo ---------------------------------------------------------------
  class Tempo {
    constructor(c = C) { this.c = c; this.ema = c.EMA_START; this.last = null; }
    key(t) {
      if (this.last !== null) {
        const gap = t - this.last;
        if (gap > 0 && gap < this.c.EMA_MAX_GAP) this.ema += this.c.EMA_ALPHA * (gap - this.ema);
      }
      this.last = t;
    }
    get duration() { return Math.round(Math.min(this.c.D_MAX, Math.max(this.c.D_MIN, this.c.K_TEMPO * this.ema))); }
    get dwell() { return Math.round(Math.min(this.c.DWELL_MAX, Math.max(this.c.DWELL_MIN, this.c.DWELL_K * this.ema))); }
    get wpm() { return Math.round(60000 / (this.ema * 5)); }
  }

  // ---- entities ------------------------------------------------------------
  const mainGroup = (svg) => [...svg.children].find((n) => n.tagName === 'g' && n.hasAttribute('transform'));
  const topY = (n) => {
    const e = n.matches('[y],[y1]') ? n : n.querySelector('[y],[y1]');
    return e ? parseFloat(e.getAttribute('y') ?? e.getAttribute('y1')) : 0;
  };
  const labelOf = (n) => { const t = n.querySelector('text'); return t ? t.textContent : (n.tagName === 'text' ? n.textContent : ''); };

  function parseSvg(markup) {
    const tpl = document.createElement('template');
    tpl.innerHTML = markup;
    return tpl.content.querySelector('svg');
  }

  // geometry.lifelines is in the same order as the lifeline nodes in the markup.
  function extract(svg, geometry) {
    const e = { participants: [], lifelines: [], stmts: [], frags: [], misc: [], occ: [], frame: [], names: new Set() };
    [...svg.children].forEach((n) => { if (n.matches('.frame-border-outer,.frame-border-inner,.frame-header-line,.frame-title')) e.frame.push(n); });
    const g = mainGroup(svg);
    if (!g) return e;
    let li = 0;
    for (const n of g.children) {
      const c = n.getAttribute('class') || '';
      if (c.includes('lifeline')) {
        e.lifelines.push({ kind: 'lifeline', key: geometry?.lifelines?.[li]?.participantName ?? String(li), node: n }); li++;
      } else if (c.includes('participant-group')) e.misc.push({ kind: 'group', key: labelOf(n), node: n, y: 0 });
      else if (c.includes('participant-bottom')) e.misc.push({ kind: 'bottom', key: n.dataset.participant, node: n, y: 0 });
      else if (c.includes('participant')) { e.participants.push({ kind: 'participant', key: n.dataset.participant, node: n }); e.names.add(n.dataset.participant); }
      else if (c.includes('occurrence')) e.occ.push({ kind: 'occ', key: n.dataset.participant, node: n, y: topY(n) });
      else if (c.includes('self-call')) e.stmts.push({ kind: 'self-call', key: labelOf(n), node: n, y: topY(n) });
      else if (c.includes('return-self')) e.stmts.push({ kind: 'return-self', key: labelOf(n), node: n, y: topY(n) });
      else if (c.includes('return')) e.stmts.push({ kind: 'return', key: labelOf(n), node: n, y: topY(n) });
      else if (c.includes('creation')) e.stmts.push({ kind: 'creation', key: labelOf(n), node: n, y: topY(n) });
      else if (c.includes('message')) e.stmts.push({ kind: 'message', key: labelOf(n), node: n, y: topY(n) });
      else if (c.includes('fragment')) e.frags.push({ kind: c.split(/\s+/).pop(), key: labelOf(n), node: n, y: topY(n) });
      else e.misc.push({ kind: c || n.tagName, key: labelOf(n), node: n, y: topY(n) });
    }
    e.stmts.sort((a, b) => a.y - b.y);
    e.frags.sort((a, b) => a.y - b.y);
    e.occ.sort((a, b) => a.y - b.y);
    return e;
  }

  // ---- reconcile -----------------------------------------------------------
  function diffList(olds, news) {
    const pairs = [];
    const sig = (x) => x.kind + '\u0001' + x.key;
    let a = 0;
    while (a < olds.length && a < news.length && sig(olds[a]) === sig(news[a])) { pairs.push([olds[a], news[a]]); a++; }
    let z = 0;
    while (z < olds.length - a && z < news.length - a && sig(olds[olds.length - 1 - z]) === sig(news[news.length - 1 - z])) {
      pairs.push([olds[olds.length - 1 - z], news[news.length - 1 - z]]); z++;
    }
    const om = olds.slice(a, olds.length - z);
    const nm = news.slice(a, news.length - z);
    const born = [];
    let i = 0;
    for (const n of nm) {
      let j = i;
      while (j < om.length && om[j].kind !== n.kind) j++;
      if (j < om.length) { pairs.push([om[j], n]); om.splice(j, 1); } else born.push(n);
    }
    return { pairs, born, gone: om };
  }

  function diffParticipants(olds, news) {
    const pairs = [], usedOld = new Set(), usedNew = new Set();
    for (const n of news) {
      const o = olds.find((x) => x.key === n.key);
      if (o) { pairs.push([o, n]); usedOld.add(o); usedNew.add(n); }
    }
    const ol = olds.filter((x) => !usedOld.has(x));
    const born = [];
    for (const n of news.filter((x) => !usedNew.has(x))) {
      const k = ol.findIndex((o) => o.key.startsWith(n.key) || n.key.startsWith(o.key));
      if (k >= 0) { n.renamedFrom = ol[k].key; pairs.push([ol[k], n]); ol.splice(k, 1); } else born.push(n);
    }
    return { pairs, born, gone: ol };
  }

  function diffOccurrences(olds, news, bornStmts) {
    const pairs = [], born = [], gone = [];
    const names = new Set([...olds, ...news].map((x) => x.key));
    for (const name of names) {
      const o = olds.filter((x) => x.key === name);
      let n = news.filter((x) => x.key === name);
      let extra = n.length - o.length;
      if (extra > 0) {
        const near = (x) => Math.min(Infinity, ...bornStmts.map((s) => Math.abs(s.y - x.y)));
        const fresh = new Set([...n].sort((p, q) => near(p) - near(q) || q.y - p.y).slice(0, extra));
        fresh.forEach((x) => born.push(x));
        n = n.filter((x) => !fresh.has(x));
      }
      n.forEach((x, i) => { if (o[i]) pairs.push([o[i], x]); });
      o.slice(n.length).forEach((x) => gone.push(x));
    }
    return { pairs, born, gone };
  }

  function reconcile(a, b) {
    const stmts = diffList(a.stmts, b.stmts);
    const parts = diffParticipants(a.participants, b.participants);
    const renamed = new Map(parts.pairs.map(([o, n]) => [o.key, n.key]));
    const lifeOld = a.lifelines.map((l) => ({ ...l, key: renamed.get(l.key) ?? l.key }));
    const lifes = diffList(lifeOld, b.lifelines);
    const frags = diffList(a.frags, b.frags);
    const misc = diffList(a.misc, b.misc);
    const occOld = a.occ.map((o) => ({ ...o, key: renamed.get(o.key) ?? o.key }));
    const occ = diffOccurrences(occOld, b.occ, stmts.born);
    const groups = { participants: parts, lifelines: lifes, stmts, frags, misc, occ };
    const out = { pairs: [], born: [], gone: [], groups };
    for (const g of Object.values(groups)) { out.pairs.push(...g.pairs); out.born.push(...g.born); out.gone.push(...g.gone); }
    return out;
  }

  // ---- feed: what the stage is allowed to show -----------------------------
  // Syntax rules cover what the trace showed. The loss guard covers the rest:
  // while someone only adds text, nothing already on screen may disappear.
  const rootsGone = (rc) => [...rc.groups.participants.gone, ...rc.groups.stmts.gone, ...rc.groups.frags.gone];

  class Feed {
    constructor(render, c = C, tempo = new Tempo(c)) {
      this.render = render; this.c = c; this.tempo = tempo;
      this.prev = ''; this.edit = null; this.names = new Set();
      this.shown = null; this.lossSince = null; this.pending = false;
    }
    reset(code) {
      this.prev = code; this.lossSince = null; this.pending = false; this.edit = null;
      const r = this.render(code);
      this.shown = extract(parseSvg(r.svg), r.geometry);
      this.names = new Set((r.geometry?.participants || []).map((p) => p.name));
      return r;
    }
    input(code, t) {
      this.tempo.key(t);
      this.edit = locateEdit(this.prev, code);
      this.code = code; this.prev = code;
      return this.offer(t, false);
    }
    offer(t, dwell, force = false) {
      const g = gate(this.code, this.edit, { names: this.names, dwell });
      let r;
      try { r = this.render(g.code); } catch (err) {
        this.throws = (this.throws || []);
        this.throws.push({ code: g.code.split('\n')[this.edit.line] ?? '', message: String(err.message || err) });
        return { r: null, reason: 'throw', wait: 0 };
      }
      const e = extract(parseSvg(r.svg), r.geometry);
      const addOnly = !this.edit.removed && !this.edit.bulk;
      const lost = this.shown ? rootsGone(reconcile(this.shown, e)).length : 0;
      if (lost && addOnly && !force) {
        if (this.lossSince === null) this.lossSince = t;
        if (t - this.lossSince < this.c.LOSS_HOLD) {
          this.pending = true;
          return { r: null, reason: 'loss', wait: dwell ? this.lossSince + this.c.LOSS_HOLD - t : this.tempo.dwell };
        }
      }
      this.lossSince = null;
      this.shown = e;
      this.names = new Set((r.geometry?.participants || []).map((p) => p.name));
      this.pending = !!g.reason && !dwell;
      return { r, code: g.code, reason: g.reason, wait: this.pending ? this.tempo.dwell : 0, lost };
    }
    settle(t) { return this.offer(t, true); }
    force(t) { return this.offer(t, true, true); }
  }

  // ---- frame metrics (same identity logic for every arm) -------------------
  const WIDTH_JUMP_PX = 20;
  const EPHEMERAL_MS = 500;
  function measureFrames(frames) {
    const live = new Map();
    let prev = null, prevW = null, seq = 0;
    const m = { frames: frames.length, ephemeral: 0, phantom: 0, widthJumps: 0, widthJumpEvents: [], ephemeralNames: [], phantomNames: [], jumpsByLine: {} };
    for (const f of frames) {
      const svg = parseSvg(f.r.svg);
      const e = extract(svg, f.r.geometry);
      const roots = (x) => [...x.participants, ...x.stmts, ...x.frags];
      if (prev) {
        const rc = reconcile(prev, e);
        const rootPairs = [...rc.groups.participants.pairs, ...rc.groups.stmts.pairs, ...rc.groups.frags.pairs];
        for (const [o, n] of rootPairs) { n._id = o._id; }
        for (const n of [...rc.groups.participants.born, ...rc.groups.stmts.born, ...rc.groups.frags.born]) {
          n._id = ++seq; live.set(n._id, { born: f.t, name: n.kind + ':' + n.key });
        }
        for (const o of [...rc.groups.participants.gone, ...rc.groups.stmts.gone, ...rc.groups.frags.gone]) {
          const rec = live.get(o._id);
          if (rec) {
            const life = f.t - rec.born;
            m.phantom++; m.phantomNames.push(rec.name);
            if (life < EPHEMERAL_MS) { m.ephemeral++; m.ephemeralNames.push(rec.name); }
            live.delete(o._id);
          }
        }
      } else {
        roots(e).forEach((n) => { n._id = 0; });
      }
      if (prevW !== null && Math.abs(f.r.width - prevW) >= WIDTH_JUMP_PX) {
        m.widthJumps++; m.widthJumpEvents.push([f.key, prevW, f.r.width]);
        const ln = f.eline ?? f.code.split('\n').length - 1;
        m.jumpsByLine[ln] = (m.jumpsByLine[ln] || 0) + 1;
      }
      prevW = f.r.width;
      prev = e;
    }
    return m;
  }

  // Frames each arm would show for a stream of {t, code}. Arms A and B see raw parses.
  function framesFor(arm, stream, render, opts = {}) {
    const c = opts.constants || C;
    const frames = [];
    frames.throws = [];
    if (arm !== 'C') { for (const ev of stream) frames.push({ t: ev.t, key: ev.code.slice(-14), code: ev.code, r: render(ev.code) }); return frames; }
    const feed = new Feed(render, c);
    const line = (code) => code.slice(-14);
    frames.push({ t: stream[0].t, key: '', code: stream[0].code, r: feed.reset(stream[0].code), eline: 0 });
    for (let i = 1; i < stream.length; i++) {
      const ev = stream[i], next = stream[i + 1];
      const until = next ? next.t : Infinity;
      let res = feed.input(ev.code, ev.t), t = ev.t;
      const eline = feed.edit.line;
      if (res.r) frames.push({ t, key: line(ev.code), code: res.code, r: res.r, eline });
      while (res.wait && t + res.wait < until) {
        t += res.wait;
        const forced = res.reason === 'loss' && feed.lossSince !== null && t - feed.lossSince >= c.LOSS_HOLD;
        res = forced ? feed.force(t) : feed.settle(t);
        if (res.r) frames.push({ t, key: line(ev.code) + '~', code: res.code, r: res.r, eline });
        if (res.r) break;
      }
    }
    frames.throws = feed.throws || [];
    return frames;
  }


  // ---- stage ----------------------------------------------------------------
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;
  const TWEEN_ATTRS = ['x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'transform', 'points'];
  const ROOT_ATTRS = ['width', 'height', 'viewBox'];

  function pairNodes(a, b) {
    const A = [a, ...a.querySelectorAll('*')], B = [b, ...b.querySelectorAll('*')];
    if (A.length !== B.length) return null;
    for (let i = 0; i < A.length; i++) if (A[i].tagName !== B[i].tagName) return null;
    return A.map((x, i) => [x, B[i]]);
  }
  function tweenFor(oldNode, node, attrs, t0, dur, out) {
    for (const attr of attrs) {
      const from = oldNode.getAttribute(attr), to = node.getAttribute(attr);
      if (from === null || to === null || from === to) continue;
      const fa = from.match(NUM), ta = to.match(NUM);
      if (!fa || !ta || fa.length !== ta.length) continue;
      out.push({ node, attr, from: fa.map(Number), to: ta.map(Number), final: to, t0, dur });
    }
  }

  function saveAndHide(node, restore) {
    restore.push({ node, style: node.getAttribute('style'), pathLength: node.getAttribute('pathLength'), x2: node.getAttribute('x2'), y2: node.getAttribute('y2') });
  }

  // A reveal is rebuilt on every mount from its start time, so re-rendering mid-stroke continues it.
  function stepsFor(ent, timing) {
    const n = ent.node, steps = [];
    const claim = new Set();
    const add = (node, type, a, b) => { if (node) { steps.push({ node, type, a, b }); claim.add(node); } };
    const rest = (a, b) => { for (const c of n.children) if (!claim.has(c)) add(c, 'fade', a, b); };
    const T = timing;
    if (ent.kind === 'lifeline') add(n, 'line', ...T.lifeline);
    else if (ent.kind === 'participant') {
      const box = n.querySelector('.participant-box');
      add(box, 'dash', ...T.box);
      steps.push({ node: box, type: 'fill', a: T.box[0] + (T.box[1] - T.box[0]) * 0.3, b: T.box[1] });
      add(n.querySelector('.participant-label'), 'wipe', ...T.text);
      rest(...T.text);
    } else if (['message', 'creation', 'return'].includes(ent.kind)) {
      add(n.querySelector('.message-line,.return-line'), 'line', ...T.shaft);
      add(n.querySelector('.message-label,.return-label'), 'wipe', ...T.text);
      rest(...T.head);
    } else if (ent.kind === 'self-call') {
      const inner = n.querySelector('svg');
      add(inner?.querySelector('.self-call-line'), 'dash', ...T.shaft);
      add(inner?.querySelector('.arrow-head'), 'fade', ...T.head);
      add(n.querySelector('.message-label'), 'wipe', ...T.text);
      claim.add(inner);
      rest(...T.head);
    } else if (ent.kind.startsWith('fragment')) {
      add(n.querySelector(':scope > .fragment-border'), 'dash', ...T.box);
      rest(...T.text);
    } else if (ent.kind === 'occ') add(n, 'fade', ...T.head);
    else add(n, 'fade', ...T.text);
    return steps;
  }

  function applyStep(st, elapsed) {
    const raw = (elapsed - st.a) / Math.max(1, st.b - st.a);
    const p = easeOut(Math.min(1, Math.max(0, raw)));
    const n = st.node;
    switch (st.type) {
      case 'line':
        if (st.x1 === undefined) { st.x1 = +n.getAttribute('x1'); st.y1 = +n.getAttribute('y1'); st.x2 = +n.getAttribute('x2'); st.y2 = +n.getAttribute('y2'); }
        n.setAttribute('x2', st.x1 + (st.x2 - st.x1) * p); n.setAttribute('y2', st.y1 + (st.y2 - st.y1) * p);
        break;
      case 'dash': n.setAttribute('pathLength', '1'); n.style.strokeDasharray = p + ' 2'; break;
      case 'fill': n.style.fillOpacity = p; break;
      case 'fade': n.style.opacity = p; break;
      case 'wipe': n.style.clipPath = 'inset(-6px ' + (100 * (1 - p)) + '% -6px -6px)'; break;
    }
  }

  class Stage {
    constructor(host, arm, c = C) {
      this.host = host; this.arm = arm; this.c = c;
      this.svg = null; this.ents = null; this.geometry = null;
      this.tweens = []; this.reveals = []; this.exits = []; this.restores = [];
      this.queueEnd = 0; this.raf = 0; this.onFirstInk = null;
      this.stats = { born: 0, snapped: 0 };
    }
    timing(kind, D) {
      if (this.arm === 'B') {
        const [a, b, c] = kind === 'participant' ? this.c.B_PARTICIPANT : this.c.B_MESSAGE;
        return kind === 'participant'
          ? { box: [0, a], lifeline: [a, a + b], text: [a + b, a + b + c], shaft: [0, a], head: [a, a + b], total: a + b + c }
          : { shaft: [0, a], head: [a, a + b], text: [a + b, a + b + c], box: [0, a + b], lifeline: [0, a], total: a + b + c };
      }
      return { box: [0, 0.55 * D], lifeline: [0.35 * D, D], text: [0.45 * D, D], shaft: [0, 0.7 * D], head: [0.62 * D, 0.82 * D], total: D };
    }
    // Longest time the visible ink lags the frame it belongs to.
    debt(now = performance.now()) { return Math.max(0, this.reveals.reduce((m, r) => Math.max(m, r.t0 + r.total - now), 0)); }
    busy() { return this.tweens.length || this.reveals.length || this.exits.length; }

    mount(r, { duration = 180, animate = true, now = performance.now() } = {}) {
      const svg = parseSvg(r.svg);
      const ents = extract(svg, r.geometry);
      const first = !this.svg;
      const motion = animate && !first && this.arm !== 'A';
      let rc = null;
      const nextReveals = [];
      const tweens = [];

      if (this.ents) {
        rc = reconcile(this.ents, ents);
        const liveIds = new Set();
        for (const [o, n] of rc.pairs) {
          if (o.reveal) { n.reveal = o.reveal; liveIds.add(n); }
          if (!motion) continue;
          if (n.reveal) continue;
          const pairs = pairNodes(o.node, n.node);
          if (pairs) for (const [a, b] of pairs) tweenFor(a, b, TWEEN_ATTRS, now, this.c.GLIDE, tweens);
        }
        if (motion) {
          const fo = this.ents.frame, fn = ents.frame;
          fo.forEach((o, i) => { if (fn[i] && o.tagName === fn[i].tagName) tweenFor(o, fn[i], TWEEN_ATTRS, now, this.c.GLIDE, tweens); });
          tweenFor(this.svg, svg, ROOT_ATTRS, now, this.c.GLIDE, tweens);
        }
      }

      // Decide reveals for what is new.
      const g = rc ? rc.groups : null;
      if (motion && g) {
        const roots = [...g.participants.born, ...[...g.stmts.born, ...g.frags.born].sort((a, b) => a.y - b.y)];
        if (roots.length) {
          this.stats.born += roots.length;
          if (this.arm === 'C') {
            for (const [, n] of rc.pairs) if (n.reveal) { n.reveal = null; this.stats.snapped++; }
            const bulk = roots.length >= this.c.BULK_MIN;
            if (!(bulk && roots.length > this.c.BATCH_MAX)) {
              const hasP = g.participants.born.length > 0;
              const each = bulk ? this.c.BATCH_EACH : duration;
              const gap = bulk ? (this.c.BATCH_TOTAL - each) / Math.max(1, roots.length - 1) : 0;
              roots.forEach((x, i) => {
                const lag = bulk ? gap * i : (x.kind === 'participant' || !hasP ? 0 : Math.max(0, Math.min(0.3 * duration, this.c.DEBT_CAP - duration)));
                x.reveal = { t0: now + lag, kind: x.kind === 'participant' ? 'participant' : 'message', D: each };
                x.reveal.total = each;
              });
            }
          } else {
            let t = Math.max(now, this.queueEnd);
            for (const x of roots) {
              const kind = x.kind === 'participant' ? 'participant' : 'message';
              const total = this.timing(kind, 0).total;
              x.reveal = { t0: t, kind, D: 0, total };
              t += total;
            }
            this.queueEnd = t;
          }
          const byName = new Map(g.participants.born.map((x) => [x.key, x.reveal]));
          for (const l of g.lifelines.born) if (byName.get(l.key)) l.reveal = byName.get(l.key);
          for (const o of g.occ.born) {
            const near = roots.filter((x) => x.y !== undefined && x.reveal).sort((p, q) => Math.abs(p.y - o.y) - Math.abs(q.y - o.y))[0];
            const rv = near?.reveal || roots[0].reveal;
            if (rv) o.reveal = rv;
          }
          for (const m of g.misc.born) if (roots[0].reveal) m.reveal = roots[0].reveal;
        }
      }

      // Bind reveals to the new DOM.
      this.restores = [];
      this.reveals = [];
      const all = [...ents.participants, ...ents.lifelines, ...ents.stmts, ...ents.frags, ...ents.occ, ...ents.misc];
      for (const e of all) {
        if (!e.reveal) continue;
        const T = this.timing(e.reveal.kind, e.reveal.D);
        const steps = stepsFor(e, T);
        for (const st of steps) saveAndHide(st.node, this.restores);
        this.reveals.push({ ent: e, steps, t0: e.reveal.t0, total: e.reveal.total ?? T.total, done: false });
      }

      // Exits fade on top of the new frame.
      const exits = [];
      if (motion && g) {
        const mg = mainGroup(svg);
        const gone = [...g.participants.gone, ...g.lifelines.gone, ...g.stmts.gone, ...g.frags.gone, ...g.occ.gone];
        for (const o of gone) {
          if (!mg) break;
          const clone = o.node.cloneNode(true);
          clone.removeAttribute('style');
          mg.appendChild(clone);
          exits.push({ node: clone, t0: now, dur: this.c.EXIT });
        }
      }

      if (this.svg) this.host.replaceChild(svg, this.svg); else this.host.appendChild(svg);
      this.svg = svg; this.ents = ents; this.geometry = r.geometry;
      this.tweens = tweens; this.exits = exits;
      this.frame(now);
      if (this.onFirstInk && this.reveals.length && rc && (g.participants.born.length || g.stmts.born.length || g.frags.born.length)) this.armFirstInk = true;
      this.schedule();
      return { born: g ? g.participants.born.length + g.stmts.born.length + g.frags.born.length : 0, ents };
    }

    schedule() {
      if (this.raf || !this.busy()) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        const now = performance.now();
        if (this.armFirstInk) { this.armFirstInk = false; this.onFirstInk?.(now); }
        this.frame(now);
        this.schedule();
      });
    }

    frame(now) {
      this.tweens = this.tweens.filter((tw) => {
        const raw = Math.min(1, (now - tw.t0) / tw.dur);
        if (raw >= 1) { tw.node.setAttribute(tw.attr, tw.final); return false; }
        const p = easeOut(Math.max(0, raw));
        let i = 0;
        tw.node.setAttribute(tw.attr, tw.final.replace(NUM, () => { const v = tw.from[i] + (tw.to[i] - tw.from[i]) * p; i++; return String(v); }));
        return true;
      });
      for (const rv of this.reveals) {
        const elapsed = now - rv.t0;
        for (const st of rv.steps) applyStep(st, elapsed);
      }
      const finished = this.reveals.filter((rv) => now - rv.t0 >= rv.total);
      if (finished.length) {
        for (const rv of finished) {
          rv.ent.reveal = null;
          const nodes = new Set(rv.steps.map((s) => s.node));
          for (const res of this.restores) {
            if (!nodes.has(res.node)) continue;
            // Blink keeps a dirty inline style unless the attribute is read before removal.
            res.node.getAttribute('style');
            if (res.style === null) res.node.removeAttribute('style'); else res.node.setAttribute('style', res.style);
            if (res.pathLength === null) res.node.removeAttribute('pathLength');
            if (res.x2 !== null) res.node.setAttribute('x2', res.x2);
            if (res.y2 !== null) res.node.setAttribute('y2', res.y2);
          }
        }
        this.reveals = this.reveals.filter((rv) => now - rv.t0 < rv.total);
      }
      this.exits = this.exits.filter((x) => {
        const raw = (now - x.t0) / x.dur;
        if (raw >= 1) { x.node.remove(); return false; }
        x.node.style.opacity = 1 - raw;
        return true;
      });
    }
  }

  // ---- session: one text stream driving one or more stages -----------------
  class Session {
    constructor(render, c = C) {
      this.render = render; this.c = c; this.stages = []; this.tempo = new Tempo(c);
      this.feed = new Feed(this.render, c, this.tempo);
      this.timer = 0; this.code = ''; this.onFrame = null;
    }
    safe(code) {
      try { return this.render(code); } catch (e) { return this.lastGood || this.render(''); }
    }
    add(stage) { this.stages.push(stage); return stage; }
    reset(code) {
      clearTimeout(this.timer);
      this.code = code;
      const r = this.feed.reset(code);
      this.lastGood = r;
      for (const s of this.stages) s.mount(s.arm === 'C' ? r : this.safe(code), { animate: false });
    }
    input(code, t = performance.now(), opts = {}) {
      clearTimeout(this.timer);
      for (const s of this.stages) if (s.arm !== 'C') { s.mount(this.safe(code), { duration: 0, now: t }); }
      this.code = code;
      const res = this.feed.input(code, t);
      this.apply(res, t, opts);
    }
    apply(res, t, opts = {}) {
      const anim = !opts.instant;
      if (res.r) {
        this.lastGood = res.r;
        for (const s of this.stages) if (s.arm === 'C') s.mount(res.r, { duration: opts.duration ?? this.tempo.duration, animate: anim, now: t });
        this.onFrame?.(res);
      }
      this.status = res.reason;
      if (res.wait) {
        this.timer = setTimeout(() => {
          const now = performance.now();
          const forced = res.reason === 'loss' && this.feed.lossSince !== null && now - this.feed.lossSince >= this.c.LOSS_HOLD;
          this.apply(forced ? this.feed.force(now) : this.feed.settle(now), now, opts);
        }, res.wait);
      }
    }
  }

  // ---- synthetic typing -----------------------------------------------------
  function mulberry(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Lognormal around the WPM mean with longer gaps after syntax. Synthetic, not measured from people.
  function synthGaps(text, wpm, seed = 7) {
    const rnd = mulberry(seed);
    const base = 60000 / (wpm * 5);
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const z = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
      let g = base * Math.exp(0.35 * z - 0.061);
      const prevCh = text[i - 1];
      if (prevCh === '\n') g *= 2.4;
      else if (prevCh === '.' || prevCh === '(' || prevCh === ':') g *= 1.4;
      out.push(g);
    }
    return out;
  }
  function typeStream(prefix, text, suffix, wpm, seed) {
    const gaps = synthGaps(text, wpm, seed);
    let t = 0;
    const s = [{ t: 0, code: prefix + suffix }];
    for (let i = 0; i < text.length; i++) { t += gaps[i]; s.push({ t, code: prefix + text.slice(0, i + 1) + suffix }); }
    return s;
  }

  root.ZmlInk = { C, locateEdit, gate, gateLine, closeParens, Tempo, Feed, Stage, Session, parseSvg, extract, reconcile, measureFrames, framesFor, synthGaps, typeStream, mainGroup, WIDTH_JUMP_PX, EPHEMERAL_MS };
})(window);
