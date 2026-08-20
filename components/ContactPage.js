/* =========================================================
   ContactPage — fades cards in on scroll and turns the contact
   form into a WhatsApp message. There's no mail server behind
   this site, so submitting reuses the same wa.me pattern already
   used for product enquiries instead of silently failing.
   ========================================================= */

import { revealOnScroll } from './scrollReveal.js';
import { attachValidation, formatPhone } from './formValidation.js';

export default class ContactPage {
  constructor({ fadeSelectors = [], formSelector, whatsappNumber }) {
    this.whatsappNumber = whatsappNumber;
    revealOnScroll(fadeSelectors);
    this._bindForm(formSelector);
    this._bindLocationMaps();
  }

  /* Maps fade in once their tiles have actually loaded, instead of
     popping in abruptly whenever the network happens to resolve. */
  _bindLocationMaps() {
    document.querySelectorAll('.location-map iframe').forEach((iframe) => {
      iframe.addEventListener('load', () => iframe.classList.add('is-loaded'), { once: true });
    });
  }

  _bindForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    /* The form carries `novalidate`, so nothing stopped an empty
       submission from opening WhatsApp before this. */
    const validate = attachValidation(form, {
      '#cfName': { required: true, type: 'name', requiredMsg: 'Please enter your name.' },
      '#cfEmail': { type: 'email' },
      '#cfPhone': { type: 'phone' },
      '#cfMessage': { required: true, minLength: 10, requiredMsg: 'Please enter your message.' },
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;

      const name = form.querySelector('#cfName')?.value.trim();
      const email = form.querySelector('#cfEmail')?.value.trim();
      const phone = formatPhone(form.querySelector('#cfPhone')?.value);
      const subject = form.querySelector('#cfSubject')?.value.trim();
      const msg = form.querySelector('#cfMessage')?.value.trim();

      let message = `Hi! I'd like to get in touch:\n\n*Name:* ${name}\n`;
      if (email) message += `*Email:* ${email}\n`;
      if (phone) message += `*Phone:* ${phone}\n`;
      if (subject) message += `*Subject:* ${subject}\n`;
      message += `\n${msg}`;

      const waUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener');
    });
  }
}
