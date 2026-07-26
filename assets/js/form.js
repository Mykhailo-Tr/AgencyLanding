document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  
  // Honeypot check - if filled, it's a bot
  if (data.website) {
    console.log('Bot detected via honeypot');
    return;
  }

  // Basic validation
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Ім\'я має містити щонайменше 2 символи';
  }
  
  if (!data.age || parseInt(data.age) < 18) {
    errors.age = 'Вам має бути щонайменше 18 років';
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
  }

  // Display errors
  const errorElements = form.querySelectorAll('input');
  errorElements.forEach(input => {
    input.classList.remove('border-accent-live');
    if (errors[input.name]) {
      input.classList.add('border-accent-live');
    }
  });

  if (Object.keys(errors).length > 0) {
    // Update Alpine.js error state
    const alpineData = form._x_dataStack[0];
    alpineData.error = Object.values(errors)[0];
    alpineData.submitting = false;
    return;
  }

  // Clear previous errors
  const alpineData = form._x_dataStack[0];
  alpineData.error = '';

  try {
    // TODO: замінити на реальний URL бекенду
    const res = await fetch('https://api.yourdomain.com/lead', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: data.name,
        age: parseInt(data.age),
        tiktok: data.tiktok || null,
        instagram: data.instagram || null,
        contact: data.contact
      })
    });

    if (!res.ok) {
      throw new Error('Помилка відправки. Спробуйте пізніше.');
    }

    // Success state
    alpineData.submitting = false;
    alpineData.success = true;
    form.reset();

  } catch (error) {
    console.error('Form submission error:', error);
    alpineData.submitting = false;
    alpineData.error = error.message || 'Помилка відправки. Спробуйте пізніше.';
    
    // Shake animation on error
    gsap.fromTo(form, 
      { x: -10 },
      { x: 10, duration: 0.1, repeat: 3, yoyo: true, ease: 'power1.inOut' }
    );
  }
});

// Real-time validation feedback
document.querySelectorAll('#leadForm input').forEach(input => {
  input.addEventListener('blur', () => {
    if (input.value.trim()) {
      input.classList.remove('border-accent-live');
    }
  });
  
  input.addEventListener('input', () => {
    input.classList.remove('border-accent-live');
    const alpineData = document.getElementById('leadForm')._x_dataStack[0];
    if (alpineData) {
      alpineData.error = '';
    }
  });
});
