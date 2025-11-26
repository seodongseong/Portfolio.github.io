// assets/js/main.js
(function(){
  const container = document.querySelector('.snap-container');
  const sections = Array.from(document.querySelectorAll('.section, .hero, .footer'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  let isScrolling = false;
  let scrollTimeout = null;

  function getCurrentIndex() {
      return sections.findIndex(sec => {
          const rect = sec.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          return rect.top <= viewportCenter && rect.bottom > viewportCenter;
      });
  }

  function scrollToSection(index) {
    if(index < 0 || index >= sections.length) return;
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(()=> { isScrolling = false; }, 700); 
  }

  container.addEventListener('wheel', (e) => {
    if(isScrolling || Math.abs(e.deltaY) < 10) { 
        e.preventDefault(); 
        return; 
    }
    
    e.preventDefault();

    const currentIndex = getCurrentIndex();
    
    if(e.deltaY > 0) {
        scrollToSection(currentIndex + 1);
    } 
    else if(e.deltaY < 0) {
        scrollToSection(currentIndex - 1);
    }
  }, { passive: false });
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      
      if(targetEl) {
        targetEl.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a => {
            const target = a.getAttribute('data-target');
            if(target === id || (id === 'top' && target === 'top')) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
      }
    });
  }, { root: container, threshold: 0.5 });

  sections.forEach(s => {
      if(s.id) io.observe(s);
  });

  window.addEventListener('load', () => {
    if(location.hash){
      const id = location.hash.replace('#','');
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
})();