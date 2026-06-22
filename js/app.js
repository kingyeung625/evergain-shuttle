(function () {
  const els = {
    clock: document.getElementById('hkt-clock'),
    routeName: document.getElementById('route-name'),
    statusBadge: document.getElementById('status-badge'),
    nextTime: document.getElementById('next-time'),
    countdown: document.getElementById('countdown'),
    detailMessage: document.getElementById('detail-message'),
    nextService: document.getElementById('next-service'),
    tabs: document.querySelectorAll('.route-tab'),
  };

  let activeRoute = 'kwaiFong';

  const STATUS_LABELS = {
    ok: '\u56FA\u5B9A\u73ED\u6B21',
    peak: '\u7E41\u5FD9\u6642\u6BB5',
    ended: '\u4ECA\u65E5\u670D\u52D9\u5DF2\u7D50\u675F',
    closed: '\u4ECA\u65E5\u4E0D\u8A2D\u670D\u52D9',
    not_today: '\u6B64\u8DEF\u7DDA\u4ECA\u65E5\u4E0D\u8A2D\u670D\u52D9',
  };

  function formatNextServiceLine(nextService) {
    if (!nextService?.firstBus) {
      return '';
    }
    const [y, m, d] = nextService.dateStr.split('-');
    return `\u4E0B\u4E00\u670D\u52D9\u65E5\uFF1A${y}\u5E74${Number(m)}\u6708${Number(d)}\u65E5 \u00B7 \u9996\u73ED ${nextService.firstBus}`;
  }

  function render() {
    const now = new Date();
    els.clock.textContent = formatHKTDateTime(now);

    const route = ROUTES[activeRoute];
    els.routeName.textContent = route.nameZh;

    const result = getNextBus(activeRoute, now);
    els.statusBadge.textContent = STATUS_LABELS[result.status] ?? result.status;
    els.statusBadge.className = `status-badge ${result.status}`;

    if (result.nextTime) {
      els.nextTime.textContent = result.nextTime;
      els.nextTime.classList.remove('muted');
      els.countdown.textContent = formatCountdown(result.secondsUntil);
    } else {
      els.nextTime.textContent = '--:--';
      els.nextTime.classList.add('muted');
      els.countdown.textContent = '';
    }

    els.detailMessage.textContent = result.message ?? '';
    els.nextService.textContent = formatNextServiceLine(result.nextService);
  }

  els.tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeRoute = tab.dataset.route;
      els.tabs.forEach((t) => {
        const isActive = t.dataset.route === activeRoute;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      render();
    });
  });

  render();
  setInterval(render, 1000);
})();