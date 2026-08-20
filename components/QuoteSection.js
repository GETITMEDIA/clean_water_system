/* =========================================================
   QuoteSection — homepage "Get a Quote" form. Populates the
   category dropdown from live product data and, like the other
   forms on this site, submits via a pre-filled WhatsApp message
   since there's no mail server behind this site.
   ========================================================= */

import { revealOnScroll } from './scrollReveal.js';
import { attachValidation, formatPhone } from './formValidation.js';

export default class QuoteSection {
  constructor({ formSelector, categorySelector, categories = [], whatsappNumber }) {
    this.whatsappNumber = whatsappNumber;
    this._populateCategories(categorySelector, categories);
    this._bindForm(formSelector);
    revealOnScroll(['.quote-perk', '.quote-form-card']);
  }

  _populateCategories(selector, categories) {
    const select = document.querySelector(selector);
    if (!select || !categories.length) return;
    select.insertAdjacentHTML(
      'beforeend',
      categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('')
    );
  }

  _bindForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    /* The form carries `novalidate`, so nothing stopped an empty
       submission from opening WhatsApp before this. */
    const validate = attachValidation(form, {
      '#qName': { required: true, type: 'name', requiredMsg: 'Please enter your name.' },
      '#qPhone': { required: true, type: 'phone', requiredMsg: 'Please enter your mobile number.' },
      '#qEmail': { type: 'email' },
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      const name = form.querySelector('#qName')?.value.trim();
      const phone = formatPhone(form.querySelector('#qPhone')?.value);
      const email = form.querySelector('#qEmail')?.value.trim();
      const category = form.querySelector('#qCategory')?.value;
      const city = form.querySelector('#qCity')?.value.trim();
      const message = form.querySelector('#qMessage')?.value.trim();

      let text = `Hi! I'd like a free quote:\n\n*Name:* ${name}\n*Phone:* ${phone}\n`;
      if (email) text += `*Email:* ${email}\n`;
      if (category) text += `*Interested In:* ${category}\n`;
      if (city) text += `*City:* ${city}\n`;
      if (message) text += `\n${message}`;

      const waUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank', 'noopener');
    });
  }
}
