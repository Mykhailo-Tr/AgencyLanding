// Wait for Alpine to be ready
document.addEventListener('alpine:init', () => {
  Alpine.data('leadForm', () => ({
    submitting: false,
    success: false,
    error: '',
    fieldErrors: {},

    async submit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Honeypot check - if filled, it's a bot
      if (data.website) {
        console.log('Bot detected via honeypot');
        return;
      }

      // Reset errors
      this.error = '';
      this.fieldErrors = {};

      // Validation
      const errors = {};

      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Ім\'я має містити щонайменше 2 символи';
      }

      if (!data.age || parseInt(data.age) < 18 || parseInt(data.age) > 100) {
        errors.age = 'Вам має бути від 18 до 100 років';
      }

      if (!data.contact || data.contact.trim().length < 3) {
        errors.contact = 'Будь ласка, введіть контактні дані';
      } else {
        // Validate Telegram or phone format
        const isTelegram = data.contact.startsWith('@');
        const isPhone = data.contact.startsWith('+');

        if (!isTelegram && !isPhone) {
          errors.contact = 'Введіть нікнейм @username або номер +38...';
        }

        if (isPhone && !/^\+\d{10,15}$/.test(data.contact)) {
          errors.contact = 'Невірний формат телефону. Використовуйте +38...';
        }

        if (isTelegram && !/^@[a-zA-Z0-9_]{5,32}$/.test(data.contact)) {
          errors.contact = 'Невірний формат Telegram. Використовуйте @username';
        }
      }

      this.fieldErrors = errors;

      if (Object.keys(errors).length > 0) {
        this.error = Object.values(errors)[0];
        this.shakeForm(form);
        return;
      }

      this.submitting = true;

      try {
        // TODO: замінити на реальний URL бекенду
        const res = await fetch('https://api.yourdomain.com/lead', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            name: data.name.trim(),
            age: parseInt(data.age),
            tiktok: data.tiktok?.trim() || null,
            instagram: data.instagram?.trim() || null,
            contact: data.contact.trim()
          })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Помилка відправки. Спробуйте пізніше.');
        }

        this.success = true;
        this.submitting = false;
        form.reset();

        // Scroll to success message
        setTimeout(() => {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

      } catch (error) {
        console.error('Form submission error:', error);
        this.submitting = false;
        this.error = error.message || 'Помилка відправки. Спробуйте пізніше.';
        this.shakeForm(form);
      }
    },

    shakeForm(form) {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(form, 
          { x: -10 },
          { x: 10, duration: 0.08, repeat: 3, yoyo: true, ease: 'power1.inOut' }
        );
      }
    },

    clearFieldError(fieldName) {
      delete this.fieldErrors[fieldName];
      if (Object.keys(this.fieldErrors).length === 0) {
        this.error = '';
      }
    },

    hasError(fieldName) {
      return this.fieldErrors[fieldName] !== undefined;
    }
  }));
});

// Fallback if Alpine doesn't initialize properly
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leadForm');
  if (form && !form._x_dataStack) {
    console.warn('Alpine.js not loaded, using fallback form handler');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alert('Форма буде відправлена після завантаження Alpine.js');
    });
  }
});
