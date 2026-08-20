/* =========================================================
   formValidation — shared client-side validation for the
   site's WhatsApp forms (homepage quote + contact page).

   Both forms carry `novalidate`, so the browser does nothing
   for us; before this, an empty form still opened WhatsApp.

   Phone fields are Indian mobile numbers: the +91 is shown as
   a fixed prefix inside the field and the input itself accepts
   10 digits only, so the country code can never be typed twice
   or submitted in a different format.
   ========================================================= */

export const PHONE_PREFIX = '+91';
const PHONE_LENGTH = 10;
/* Indian mobile numbers start with 6-9. */
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/* ---------- error message plumbing ---------- */

function fieldWrap(input) {
  return input.closest('.quote-field, .contact-field') || input.parentElement;
}

function showError(input, msg) {
  const wrap = fieldWrap(input);
  if (!wrap) return;
  let el = wrap.querySelector('.field-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'field-error';
    wrap.appendChild(el);
  }
  el.textContent = msg;
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  if (!input.id) return;
  el.id = input.id + '-error';
  input.setAttribute('aria-describedby', el.id);
}

function clearError(input) {
  const wrap = fieldWrap(input);
  if (!wrap) return;
  const el = wrap.querySelector('.field-error');
  if (el) el.remove();
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

/* ---------- individual rules ---------- */

function validateOne(input, rule) {
  const value = input.value.trim();

  if (rule.required && !value) {
    return rule.requiredMsg || 'This field is required.';
  }
  if (!value) return null; // optional + empty: nothing more to check

  if (rule.type === 'phone' && !PHONE_RE.test(value)) {
    return value.length !== PHONE_LENGTH
      ? `Enter a ${PHONE_LENGTH}-digit mobile number.`
      : 'Enter a valid Indian mobile number (starting 6-9).';
  }
  if (rule.type === 'email' && !EMAIL_RE.test(value)) {
    return 'Enter a valid email address, e.g. name@example.com.';
  }
  if (rule.minLength && value.length < rule.minLength) {
    return `Please enter at least ${rule.minLength} characters.`;
  }
  if (rule.type === 'name' && !/[a-zA-Z]/.test(value)) {
    return 'Please enter your name.';
  }
  return null;
}

/* ---------- phone field: +91 prefix + digits only ---------- */

export function setupPhoneField(input) {
  if (!input || input.dataset.phoneReady) return;
  input.dataset.phoneReady = '1';

  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('maxlength', String(PHONE_LENGTH));
  input.setAttribute('autocomplete', 'tel-national');
  input.setAttribute('placeholder', '98765 43210');

  /* Visual +91 prefix sitting inside the existing input box, so the
     field keeps the border/radius the design already uses. */
  const wrap = document.createElement('div');
  wrap.className = 'phone-input-wrap';
  input.parentNode.insertBefore(wrap, input);
  const prefix = document.createElement('span');
  prefix.className = 'phone-input-prefix';
  prefix.textContent = PHONE_PREFIX;
  prefix.setAttribute('aria-hidden', 'true');
  wrap.appendChild(prefix);
  wrap.appendChild(input);

  /* Digits only — covers typing, pasting, autofill and drag-drop,
     which keypress-blocking alone would miss. */
  const sanitize = () => {
    const cleaned = input.value.replace(/\D/g, '').slice(0, PHONE_LENGTH);
    if (cleaned !== input.value) {
      const atEnd = input.selectionStart === input.value.length;
      input.value = cleaned;
      if (atEnd) input.setSelectionRange(cleaned.length, cleaned.length);
    }
  };
  input.addEventListener('input', sanitize);
  input.addEventListener('paste', () => setTimeout(sanitize, 0));
  /* Block obvious non-numeric keys early so the field never flickers. */
  input.addEventListener('keypress', (e) => {
    if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
  });
}

/* ---------- public API ---------- */

/**
 * Wire validation to a form.
 * @param {HTMLFormElement} form
 * @param {Object} rules  map of "#selector" -> { required, type, minLength, requiredMsg }
 * @returns {() => boolean} validate() — true when the whole form passes
 */
export function attachValidation(form, rules) {
  const entries = Object.entries(rules)
    .map(([sel, rule]) => [form.querySelector(sel), rule])
    .filter(([el]) => el);

  entries.forEach(([input, rule]) => {
    if (rule.type === 'phone') setupPhoneField(input);

    /* Validate on blur, but once a field is already flagged, re-check as
       they type so the error clears the moment it's fixed. */
    input.addEventListener('blur', () => {
      const err = validateOne(input, rule);
      err ? showError(input, err) : clearError(input);
    });
    input.addEventListener('input', () => {
      if (!input.classList.contains('is-invalid')) return;
      const err = validateOne(input, rule);
      if (!err) clearError(input);
    });
  });

  return function validate() {
    let firstBad = null;
    entries.forEach(([input, rule]) => {
      const err = validateOne(input, rule);
      if (err) {
        showError(input, err);
        if (!firstBad) firstBad = input;
      } else {
        clearError(input);
      }
    });
    if (firstBad) {
      firstBad.focus();
      firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };
}

/** Format a 10-digit national number for sending. */
export function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `${PHONE_PREFIX} ${digits}` : '';
}
