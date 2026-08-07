(function (window, document) {
  function getScrollContainer($element) {
    let $parent = $element.parentElement;
    while ($parent && $parent !== document.body) {
      const style = window.getComputedStyle($parent);
      if (/(auto|scroll)/.test(style.overflowY) && $parent.scrollHeight > $parent.clientHeight) {
        return $parent;
      }
      $parent = $parent.parentElement;
    }
    return null;
  }

  function scrollMenuIntoView($menu) {
    const $container = getScrollContainer($menu);
    if (!$container) {
      return;
    }

    const padding = 8;
    const containerRect = $container.getBoundingClientRect();
    const menuRect = $menu.getBoundingClientRect();

    if (menuRect.top < containerRect.top + padding) {
      $container.scrollTop -= containerRect.top + padding - menuRect.top;
    } else if (menuRect.bottom > containerRect.bottom - padding) {
      $container.scrollTop += menuRect.bottom - containerRect.bottom + padding;
    }
  }

  function register($toc) {
    const headingToMenu = new Map();
    const $menus = Array.from($toc.querySelectorAll('.menu-list > li > a'));

    for (const $menu of $menus) {
      const elementId = $menu.getAttribute('href').trim().slice(1);
      const $heading = document.getElementById(elementId);
      if ($heading) {
        headingToMenu.set($heading, $menu);
      }
    }

    const $headings = Array.from(headingToMenu.keys());
    let $activeMenu = null;

    const updateActiveMenu = () => {
      let $heading = $headings[0];
      const topOffset = 16;

      for (const $candidate of $headings) {
        if ($candidate.getBoundingClientRect().top <= topOffset) {
          $heading = $candidate;
        } else {
          break;
        }
      }

      if (!$heading || !headingToMenu.has($heading)) {
        return;
      }

      const $menu = headingToMenu.get($heading);
      if ($menu === $activeMenu) {
        return;
      }

      $menus.forEach(($item) => $item.classList.remove('is-active'));
      $menu.classList.add('is-active');

      let $menuList = $menu.parentElement.parentElement;
      while (
        $menuList.classList.contains('menu-list') &&
        $menuList.parentElement.tagName.toLowerCase() === 'li'
      ) {
        $menuList.parentElement.children[0].classList.add('is-active');
        $menuList = $menuList.parentElement.parentElement;
      }

      $activeMenu = $menu;
      scrollMenuIntoView($menu);
    };

    let scheduled = false;
    const scheduleUpdate = () => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      window.requestAnimationFrame(() => {
        updateActiveMenu();
        scheduled = false;
      });
    };

    for (const $heading of $headings) {
      const $menu = headingToMenu.get($heading);
      $menu.setAttribute('data-href', $menu.getAttribute('href'));
      $menu.setAttribute('href', 'javascript:;');
      $menu.addEventListener('click', () => {
        if (typeof $heading.scrollIntoView === 'function') {
          $heading.scrollIntoView({ behavior: 'smooth' });
        }
        const anchor = $menu.getAttribute('data-href');
        if (history.pushState) {
          history.pushState(null, null, anchor);
        } else {
          location.hash = anchor;
        }
      });
      $heading.style.scrollMargin = '1em';
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    updateActiveMenu();
  }

  document.querySelectorAll('#toc').forEach(register);
})(window, document);
