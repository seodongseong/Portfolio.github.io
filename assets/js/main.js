// assets/js/main.js
(function () {
  const container = document.querySelector('.snap-container');
  const sections = Array.from(document.querySelectorAll('.section, .hero, .footer'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  let isScrolling = false;
  let scrollTimeout = null;

  // 현재 뷰포트 상단 근처(헤더 아래)에 있는 섹션의 인덱스를 찾습니다.
  function getCurrentIndex() {
    return sections.findIndex(sec => {
      const rect = sec.getBoundingClientRect();
      // 섹션의 뷰포트 내 상단 경계가 뷰포트의 상단(0)에서 64px(헤더 높이) 이내에 있을 때 활성화
      return rect.top <= 64 && rect.bottom > 64;
    });
  }

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;

    // 이미 스크롤 중이라면 함수를 종료합니다.
    if (isScrolling) return;

    isScrolling = true;
    sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 스크롤 완료 후 isScrolling을 false로 설정합니다.
    clearTimeout(scrollTimeout);
    // 스크롤 애니메이션 시간을 고려하여 700ms 후 isScrolling 해제
    scrollTimeout = setTimeout(() => { isScrolling = false; }, 700);
  }

  // 휠 이벤트 리스너 (데스크톱 휠 스크롤 제어)
  container.addEventListener('wheel', (e) => {
    // 스크롤 중이거나 휠 이동량이 너무 작을 경우 이벤트를 중지하고 무시합니다.
    if (isScrolling || Math.abs(e.deltaY) < 10) {
      e.preventDefault();
      return;
    }

    // 마우스 휠 기본 동작 방지 (섹션 단위 스크롤을 위해)
    e.preventDefault();

    const currentIndex = getCurrentIndex();

    if (e.deltaY > 0) { // 아래로 스크롤
      scrollToSection(currentIndex + 1);
    }
    else if (e.deltaY < 0) { // 위로 스크롤
      scrollToSection(currentIndex - 1);
    }
  }, { passive: false }); // preventDefault()를 위해 passive: false 설정


  // 네비게이션 링크 클릭 이벤트
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        // 클릭 시에도 smooth scroll을 적용
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection Observer (활성 섹션 하이라이트)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          const target = a.getAttribute('data-target');
          if (target === id || (id === 'top' && target === 'top')) {
            a.classList.add('active');
          } else {
            a.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: container,
    // 헤더(64px) 아래를 기준으로 판단하도록 rootMargin 설정
    // 뷰포트의 상단 64px을 제외한 영역이 'top'에 해당하는 경계가 됩니다.
    rootMargin: '-64px 0px 0px 0px',
    // 섹션 시작점이 헤더 아래에 도달했을 때 활성화되도록 threshold를 0.1로 낮춥니다.
    threshold: 0.1
  });

  sections.forEach(s => {
    if (s.id) io.observe(s);
  });

  // URL 해시(#about 등) 처리 로직
  window.addEventListener('load', () => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });


  const contactCards = document.querySelectorAll('#contact .contact-card[data-copy]');

  contactCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // 기본 <a> 태그 동작(href="#") 방지
      e.preventDefault();

      const textToCopy = card.getAttribute('data-copy');

      if (textToCopy && navigator.clipboard) {
        // 비동기 복사 API 사용 (가장 권장됨)
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            // 사용자에게 피드백 제공
            alert(`${card.querySelector('.contact-card__title').textContent}이(가) 복사되었습니다: ${textToCopy}`);
          })
          .catch(err => {
            console.error('클립보드 복사 실패:', err);
            alert('복사에 실패했습니다. 콘솔을 확인해주세요.');
          });
      } else {
        // 오래된 브라우저를 위한 대체 방법 (현재는 거의 필요 없음)
        console.error('navigator.clipboard를 지원하지 않거나 복사할 내용이 없습니다.');
      }
    });
  });
})();