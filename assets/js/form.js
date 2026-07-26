document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('leadForm');
  
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get Alpine data
    const alpineData = form._x_dataStack?.[0];
    if (!alpineData) return;

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Honeypot check - if filled, it's a bot
    if (data.website) {
      console.log('Bot detected via honeypot');
      return;
    }

    // Remove honeypot from data
    delete data.website;

    // Validate required fields
    const errors = validateForm(data);
    if (errors.length > 0) {
      alpineData.error = errors[0];
      shakeForm();
      return;
    }

    // Set loading state
    alpineData.submitting = true;
    alpineData.error = '';

    try {
      // TODO: замінити на реальний URL бекенду
      const response = await fetch('https://api.yourdomain.com/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Помилка відправки. Спробуйте пізніше.');
      }

      // Success state
      alpineData.submitting = false;
      alpineData.success = true;
      
      // Reset form
      form.reset();

    } catch (error) {
      alpineData.submitting = false;
      alpineData.error = error.message || 'Сталася помилка. Спробуйте ще раз.';
      shakeForm();
    }
  });

  function validateForm(data) {
    const errors = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Ім\'я має містити мінімум 2 символи');
    }

    // Age validation
    if (!data.age || parseInt(data.age) < 18) {
      errors.push('Вам має бути не менше 18 років');
    }

    // Contact validation (Telegram or Phone)
    if (!data.contact || data.contact.trim().length < 3) {
      errors.push('Введіть Telegram (@username) або номер телефону (+38...)');
    } else {
      const contact = data.contact.trim();
      const isTelegram = contact.startsWith('@');
      const isPhone = contact.startsWith('+') && /^\+\d{10,}$/.test(contact.replace(/\s/g, ''));
      
      if (!isTelegram && !isPhone) {
        errors.push('Невірний формат. Використовуйте @username або +380XXXXXXXXX');
      }
    }

    return errors;
  }

  function shakeForm() {
    form.classList.add('shake');
    setTimeout(() => {
      form.classList.remove('shake');
    }, 300);
  }
});
