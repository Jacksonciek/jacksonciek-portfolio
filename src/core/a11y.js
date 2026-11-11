const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

// Keeps Tab and Shift+Tab inside `el`; returns a function that releases the trap.
export function trapFocus(el) {
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length);
    if (!items.length) return e.preventDefault();
    const first = items[0], last = items[items.length - 1], at = document.activeElement;
    const to = !el.contains(at) ? (e.shiftKey ? last : first) : e.shiftKey && at === first ? last : !e.shiftKey && at === last ? first : null;
    if (to) { e.preventDefault(); to.focus(); }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}