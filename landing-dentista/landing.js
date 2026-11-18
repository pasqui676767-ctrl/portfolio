// Modulo a passaggi della landing.
// ENDPOINT: l'indirizzo del servizio moduli del cliente (es. Formspree). Vuoto = pagina dimostrativa:
// non invia nulla e porta solo alla pagina di ringraziamento.
const ENDPOINT = '';

const form = document.querySelector('[data-steps]');
if (form) {
  const steps = [...form.querySelectorAll('.step')];
  const bar = form.querySelector('.bar span');
  const count = form.querySelector('.lead-form__count');
  const back = form.querySelector('.back');
  const next = form.querySelector('[data-next]');
  const send = form.querySelector('[data-send]');
  let i = 0;

  const show = (n, focus) => {
    i = n;
    steps.forEach((s, k) => { s.hidden = k !== n; });
    bar.style.width = `${Math.round(((n + 1) / steps.length) * 100)}%`;
    count.textContent = `Passaggio ${n + 1} di ${steps.length}`;
    back.hidden = n === 0;
    const last = n === steps.length - 1;
    next.hidden = last; send.hidden = !last;
    if (focus) { const f = steps[n].querySelector('input'); if (f) f.focus({ preventScroll: true }); }
  };

  const choiceOk = (s) => {
    const group = s.querySelector('input[type=radio]');
    if (!group) return true;
    const ok = !!s.querySelector('input[type=radio]:checked');
    const e = s.querySelector('.err'); if (e) e.hidden = ok;
    return ok;
  };

  // una scelta porta da sola al passaggio dopo
  form.addEventListener('change', (ev) => {
    if (ev.target.type === 'radio' && i < steps.length - 1) {
      const e = steps[i].querySelector('.err'); if (e) e.hidden = true;
      setTimeout(() => show(i + 1, true), 180);
    }
  });
  next.addEventListener('click', () => { if (choiceOk(steps[i])) show(i + 1, true); });
  back.addEventListener('click', () => show(i - 1, true));

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    let first = null;
    for (const f of steps[i].querySelectorAll('[required]')) {
      const err = form.querySelector(`#${f.getAttribute('aria-describedby')}`);
      let ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
      if (ok && f.type === 'tel') ok = f.value.replace(/\D/g, '').length >= 9;
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.hidden = ok;
      if (!ok && !first) first = f;
    }
    if (first) { first.focus(); return; }
    if (ENDPOINT) {
      send.disabled = true; send.textContent = 'Invio in corso…';
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!r.ok) throw new Error(r.status);
      } catch (e) {
        send.disabled = false; send.textContent = form.dataset.label;
        form.querySelector('.send-err').hidden = false;
        return;
      }
    }
    location.href = 'grazie.html';
  });

  show(0, false);
}
