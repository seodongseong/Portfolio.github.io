// assets/js/main.js
(function () {
  const snapContainerElement = document.querySelector('.snap-container');
  const allSectionElements = Array.from(document.querySelectorAll('.section, .hero, .footer'));
  const navigationLinkElements = Array.from(document.querySelectorAll('.nav-link'));
  const siteHeaderElement = document.querySelector('.site-header');
  const scrollIndicatorBarElement = document.querySelector('.scroll-indicator__bar');

  let isCurrentlyScrolling = false;
  let scrollAnimationTimeoutId = null;

  // 현재 뷰포트 상단 근처(헤더 아래)에 있는 섹션의 인덱스를 찾습니다.
  function findCurrentActiveSectionIndex() {
    return allSectionElements.findIndex(sectionElement => {
      const sectionBoundingRect = sectionElement.getBoundingClientRect();
      // 섹션의 뷰포트 내 상단 경계가 뷰포트의 상단(0)에서 64px(헤더 높이) 이내에 있을 때 활성화
      return sectionBoundingRect.top <= 64 && sectionBoundingRect.bottom > 64;
    });
  }

  function scrollToTargetSectionByIndex(targetSectionIndex) {
    if (targetSectionIndex < 0 || targetSectionIndex >= allSectionElements.length) return;

    // 이미 스크롤 중이라면 함수를 종료합니다.
    if (isCurrentlyScrolling) return;

    isCurrentlyScrolling = true;
    allSectionElements[targetSectionIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 스크롤 완료 후 isCurrentlyScrolling을 false로 설정합니다.
    clearTimeout(scrollAnimationTimeoutId);
    // 스크롤 애니메이션 시간을 고려하여 700ms 후 isCurrentlyScrolling 해제
    scrollAnimationTimeoutId = setTimeout(() => { isCurrentlyScrolling = false; }, 700);
  }

  // 스크롤 진행률을 계산하여 인디케이터 업데이트
  function updateScrollProgressIndicator() {
    if (!scrollIndicatorBarElement || !snapContainerElement) return;

    const containerScrollTop = snapContainerElement.scrollTop;
    const containerScrollHeight = snapContainerElement.scrollHeight;
    const containerClientHeight = snapContainerElement.clientHeight;
    const totalScrollableDistance = containerScrollHeight - containerClientHeight;
    
    if (totalScrollableDistance > 0) {
      const scrollProgressPercentage = (containerScrollTop / totalScrollableDistance) * 100;
      scrollIndicatorBarElement.style.width = `${scrollProgressPercentage}%`;
    }
  }

  // 헤더 스크롤 효과 적용
  function updateHeaderScrollState() {
    if (!siteHeaderElement) return;

    const scrollTop = snapContainerElement.scrollTop;
    if (scrollTop > 50) {
      siteHeaderElement.classList.add('scrolled');
    } else {
      siteHeaderElement.classList.remove('scrolled');
    }
  }

  // 휠 이벤트 리스너 (데스크톱 휠 스크롤 제어)
  snapContainerElement.addEventListener('wheel', (wheelEvent) => {
    // 스크롤 중이거나 휠 이동량이 너무 작을 경우 이벤트를 중지하고 무시합니다.
    if (isCurrentlyScrolling || Math.abs(wheelEvent.deltaY) < 10) {
      wheelEvent.preventDefault();
      return;
    }

    // 마우스 휠 기본 동작 방지 (섹션 단위 스크롤을 위해)
    wheelEvent.preventDefault();

    const currentActiveSectionIndex = findCurrentActiveSectionIndex();

    if (wheelEvent.deltaY > 0) { // 아래로 스크롤
      scrollToTargetSectionByIndex(currentActiveSectionIndex + 1);
    }
    else if (wheelEvent.deltaY < 0) { // 위로 스크롤
      scrollToTargetSectionByIndex(currentActiveSectionIndex - 1);
    }
  }, { passive: false }); // preventDefault()를 위해 passive: false 설정

  // 스크롤 이벤트 리스너 (인디케이터 및 헤더 업데이트)
  snapContainerElement.addEventListener('scroll', () => {
    updateScrollProgressIndicator();
    updateHeaderScrollState();
  });


  // 네비게이션 링크 클릭 이벤트
  navigationLinkElements.forEach(navigationLinkElement => {
    navigationLinkElement.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault();
      const targetSectionId = navigationLinkElement.getAttribute('data-target');
      const targetSectionElement = document.getElementById(targetSectionId);

      if (targetSectionElement) {
        // 클릭 시에도 smooth scroll을 적용
        targetSectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection Observer (활성 섹션 하이라이트 및 애니메이션)
  const intersectionObserverForActiveSection = new IntersectionObserver((intersectionObserverEntries) => {
    intersectionObserverEntries.forEach(intersectionObserverEntry => {
      if (intersectionObserverEntry.isIntersecting) {
        const activeSectionElement = intersectionObserverEntry.target;
        const activeSectionId = activeSectionElement.id;
        
        // 네비게이션 활성화
        navigationLinkElements.forEach(navigationLinkElement => {
          const linkTargetSectionId = navigationLinkElement.getAttribute('data-target');
          if (linkTargetSectionId === activeSectionId || (activeSectionId === 'top' && linkTargetSectionId === 'top')) {
            navigationLinkElement.classList.add('active');
          } else {
            navigationLinkElement.classList.remove('active');
          }
        });
        
        // 섹션 애니메이션 활성화
        if (activeSectionElement.classList.contains('section')) {
          activeSectionElement.classList.add('animate-in');
        }
      }
    });
  }, {
    root: snapContainerElement,
    // 헤더(64px) 아래를 기준으로 판단하도록 rootMargin 설정
    // 뷰포트의 상단 64px을 제외한 영역이 'top'에 해당하는 경계가 됩니다.
    rootMargin: '-64px 0px -20% 0px',
    // 섹션이 뷰포트에 일정 부분 들어왔을 때 활성화
    threshold: 0.15
  });

  allSectionElements.forEach(sectionElement => {
    if (sectionElement.id) intersectionObserverForActiveSection.observe(sectionElement);
  });
  
  // Hero 섹션은 즉시 애니메이션 실행
  const heroSectionElement = document.querySelector('.hero');
  if (heroSectionElement) {
    setTimeout(() => {
      heroSectionElement.classList.add('animate-in');
    }, 100);
  }

  // 초기 로드 시 이미 보이는 섹션에 애니메이션 적용
  function initializeVisibleSections() {
    allSectionElements.forEach(sectionElement => {
      if (sectionElement.classList.contains('section')) {
        const sectionBoundingRect = sectionElement.getBoundingClientRect();
        const isVisible = sectionBoundingRect.top < window.innerHeight && sectionBoundingRect.bottom > 0;
        if (isVisible) {
          sectionElement.classList.add('animate-in');
        }
      }
    });
  }

  // URL 해시(#about 등) 처리 로직
  window.addEventListener('load', () => {
    // 초기 로드 시 스크롤 인디케이터 및 헤더 상태 업데이트
    updateScrollProgressIndicator();
    updateHeaderScrollState();
    
    // 초기 로드 시 보이는 섹션에 애니메이션 적용
    setTimeout(() => {
      initializeVisibleSections();
    }, 300);
    
    if (location.hash) {
      const targetSectionIdFromHash = location.hash.replace('#', '');
      const targetSectionElementFromHash = document.getElementById(targetSectionIdFromHash);
      if (targetSectionElementFromHash) {
        targetSectionElementFromHash.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 해시로 이동한 섹션에도 애니메이션 적용
        setTimeout(() => {
          if (targetSectionElementFromHash.classList.contains('section')) {
            targetSectionElementFromHash.classList.add('animate-in');
          }
        }, 500);
      }
    }
  });

  // 연락처 카드 클립보드 복사 기능
  const contactCardElementsWithCopyData = document.querySelectorAll('#contact .contact-card[data-copy]');

  contactCardElementsWithCopyData.forEach(contactCardElement => {
    contactCardElement.addEventListener('click', (clickEvent) => {
      // 기본 <a> 태그 동작(href="#") 방지
      clickEvent.preventDefault();

      const textToCopyToClipboard = contactCardElement.getAttribute('data-copy');

      if (textToCopyToClipboard && navigator.clipboard) {
        // 비동기 복사 API 사용 (가장 권장됨)
        navigator.clipboard.writeText(textToCopyToClipboard)
          .then(() => {
            // 사용자에게 피드백 제공
            const contactCardTitleElement = contactCardElement.querySelector('.contact-card__title');
            const contactCardTitleText = contactCardTitleElement ? contactCardTitleElement.textContent : '정보';
            alert(`${contactCardTitleText}이(가) 복사되었습니다: ${textToCopyToClipboard}`);
          })
          .catch(clipboardError => {
            console.error('클립보드 복사 실패:', clipboardError);
            alert('복사에 실패했습니다. 콘솔을 확인해주세요.');
          });
      } else {
        // 오래된 브라우저를 위한 대체 방법 (현재는 거의 필요 없음)
        console.error('navigator.clipboard를 지원하지 않거나 복사할 내용이 없습니다.');
      }
    });
  });
})();