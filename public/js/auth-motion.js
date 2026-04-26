(function () {
  const motion = window.Motion || window.motion;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hàm cứu cánh: Nếu lỗi thì hiện tất cả lên ngay
  const showFallback = () => {
    document.querySelectorAll('.auth-motion-card, .auth-motion-stagger > *').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.documentElement.classList.add('auth-motion-ready');
  };

  if (!motion || reduceMotion) {
    console.warn('Motion library not found or reduced motion enabled');
    showFallback();
    return;
  }

  try {
    const { animate, stagger, hover, press } = motion;

    document.documentElement.classList.add('auth-motion-ready');

    // Chạy hiệu ứng chính
    animate('.auth-motion-card', { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] }, {
      delay: 0.1,
      duration: 0.8,
      easing: [0.22, 1, 0.36, 1]
    });

    animate('.auth-motion-stagger > *', { opacity: [0, 1], y: [20, 0] }, {
      delay: stagger(0.1, { startDelay: 0.3 }),
      duration: 0.5,
      easing: 'easeOut'
    });

    // Các tương tác khi hover/press
    document.querySelectorAll('.auth-motion-card .btn, .auth-links a').forEach((element) => {
      hover(element, () => {
        animate(element, { y: -2, scale: 1.015 }, { duration: 0.18 });
        return () => animate(element, { y: 0, scale: 1 }, { duration: 0.18 });
      });

      press(element, () => {
        animate(element, { scale: 0.985 }, { duration: 0.12 });
        return () => animate(element, { scale: 1 }, { duration: 0.12 });
      });
    });
  } catch (e) {
    console.error('Motion animation error:', e);
    showFallback();
  }
})();
