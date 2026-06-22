(function () {
  const els = {
    clock: document.getElementById('hkt-clock'),
    routeName: document.getElementById('route-name'),
    statusBadge: document.getElementById('status-badge'),
    nextTime: document.getElementById('next-time'),
    countdown: document.getElementById('countdown'),
    detailMessage: document.getElementById('detail-message'),
    nextService: document.getElementById('next-service'),
    timetableAccordion: document.getElementById('timetable-accordion'),
    timetablePanel: document.getElementById('timetable-panel'),
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

  const DAY_TYPE_LABELS = {
    weekday: '\u661F\u671F\u4E00\u81F3\u4E94',
    saturday: '\u661F\u671F\u516D',
  };

  function formatNextServiceLine(nextService) {
    if (!nextService?.firstBus) {
      return '';
    }
    const [y, m, d] = nextService.dateStr.split('-');
    return `\u4E0B\u4E00\u670D\u52D9\u65E5\uFF1A${y}\u5E74${Number(m)}\u6708${Number(d)}\u65E5 \u00B7 \u9996\u73ED ${nextService.firstBus}`;
  }

  function formatPeakPeriods(peakPeriods) {
    return peakPeriods
      .map((period) => `${period.start}\u2013${period.end}\uFF08\u7D04\u6BCF ${period.intervalMinutes} \u5206\u9418\u4E00\u73ED\uFF09`)
      .join('\u3001');
  }

  function buildTimesMarkup(times) {
    if (!times?.length) {
      return '<p class="timetable-empty">\u4ECA\u65E5\u7121\u56FA\u5B9A\u73ED\u6B21</p>';
    }

    return `<ul class="timetable-times">${times
      .map((time) => `<li>${time}</li>`)
      .join('')}</ul>`;
  }

  function buildScheduleSection(dayType, schedule) {
    const title = DAY_TYPE_LABELS[dayType] ?? dayType;
    const peakNote = schedule.peakPeriods?.length
      ? `<p class="timetable-note">\u7E41\u5FD9\u6642\u6BB5\uFF1A${formatPeakPeriods(schedule.peakPeriods)}</p>`
      : '';

    return `
      <section class="timetable-section">
        <h3>${title}</h3>
        ${peakNote}
        ${buildTimesMarkup(schedule.fixedTimes)}
      </section>
    `;
  }

  function renderTimetable(routeId) {
    const route = ROUTES[routeId];
    if (!route) {
      els.timetablePanel.innerHTML = '';
      return;
    }

    const sections = route.serviceDays
      .map((dayType) => {
        const schedule = route[dayType];
        if (!schedule) {
          return '';
        }
        return buildScheduleSection(dayType, schedule);
      })
      .join('');

    els.timetablePanel.innerHTML = sections;
  }

  function render() {
    const now = new Date();
    els.clock.textContent = formatHKTDateTime(now);

    const route = ROUTES[activeRoute];
    els.routeName.textContent = route.nameZh;

    const result = getNextBus(activeRoute, now);
    els.statusBadge.textContent = STATUS_LABELS[result.status] ?? result.status;
    els.statusBadge.className = `status-badge ${result.status}`;

    els.nextTime.classList.remove('muted', 'peak-message');

    if (result.status === 'peak' && activeRoute === 'kwaiFong') {
      els.nextTime.textContent = result.message;
      els.nextTime.classList.add('peak-message');
      els.countdown.textContent = '';
      els.detailMessage.textContent = '';
    } else if (result.nextTime) {
      els.nextTime.textContent = result.nextTime;
      els.countdown.textContent = formatCountdown(result.secondsUntil);
      els.detailMessage.textContent = result.message ?? '';
    } else {
      els.nextTime.textContent = '--:--';
      els.nextTime.classList.add('muted');
      els.countdown.textContent = '';
      els.detailMessage.textContent = result.message ?? '';
    }

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
      els.timetableAccordion.open = false;
      renderTimetable(activeRoute);
      render();
    });
  });

  renderTimetable(activeRoute);
  render();
  setInterval(render, 1000);
})();
