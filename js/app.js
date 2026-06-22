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
    timetableDayContent: document.getElementById('timetable-day-content'),
    dayTabs: document.querySelectorAll('.timetable-day-tab'),
    tabs: document.querySelectorAll('.route-tab'),
  };

  let activeRoute = 'kwaiFong';
  let activeDayTab = 'weekday';

  const STATUS_LABELS = {
    ok: '\u56FA\u5B9A\u73ED\u6B21',
    peak: '\u7E41\u5FD9\u6642\u6BB5',
    ended: '\u4ECA\u65E5\u670D\u52D9\u5DF2\u7D50\u675F',
    closed: '\u4ECA\u65E5\u4E0D\u8A2D\u670D\u52D9',
    not_today: '\u6B64\u8DEF\u7DDA\u4ECA\u65E5\u4E0D\u8A2D\u670D\u52D9',
  };

  const PERIOD_LABELS = {
    morning: '\u4E0A\u5348',
    afternoon: '\u4E0B\u5348',
  };

  const PEAK_SERVICE_MESSAGE = '\u4E0D\u5B9A\u6642\u958B\u8ECA\uFF0C\u7D04 5 \u5206\u9418\u4E00\u73ED';

  function parseTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function formatNextServiceLine(nextService) {
    if (!nextService?.firstBus) {
      return '';
    }
    const [y, m, d] = nextService.dateStr.split('-');
    return `\u4E0B\u4E00\u670D\u52D9\u65E5\uFF1A${y}\u5E74${Number(m)}\u6708${Number(d)}\u65E5 \u00B7 \u9996\u73ED ${nextService.firstBus}`;
  }

  function buildNoServiceMarkup() {
    return '<p class="timetable-no-service">\u6C92\u6709\u670D\u52D9</p>';
  }

  function buildTimelineItems(schedule) {
    const items = [];

    schedule.fixedTimes?.forEach((time) => {
      items.push({
        type: 'fixed',
        time,
        sortKey: parseTimeToMinutes(time),
      });
    });

    schedule.peakPeriods?.forEach((period) => {
      items.push({
        type: 'peak',
        start: period.start,
        end: period.end,
        intervalMinutes: period.intervalMinutes,
        sortKey: parseTimeToMinutes(period.start),
      });
    });

    return items.sort((a, b) => a.sortKey - b.sortKey);
  }

  function renderTimelineItem(item) {
    if (item.type === 'peak') {
      const ariaLabel = `${item.start} \u81F3 ${item.end}\uFF0C${PEAK_SERVICE_MESSAGE}`;
      return `
        <li class="timetable-peak" aria-label="${ariaLabel}">
          <span class="timetable-peak-range">${item.start} \u2013 ${item.end}</span>
          <span class="timetable-peak-note">${PEAK_SERVICE_MESSAGE}</span>
        </li>
      `;
    }

    return `<li>${item.time}</li>`;
  }

  function groupItemsByPeriod(items) {
    const groups = {
      morning: [],
      afternoon: [],
    };

    items.forEach((item) => {
      const minutes = item.type === 'fixed'
        ? parseTimeToMinutes(item.time)
        : parseTimeToMinutes(item.start);
      const key = minutes < 12 * 60 ? 'morning' : 'afternoon';
      groups[key].push(item);
    });

    return groups;
  }

  function buildGroupedTimelineMarkup(items) {
    const groups = groupItemsByPeriod(items);
    const sections = ['morning', 'afternoon']
      .filter((period) => groups[period].length > 0)
      .map((period) => `
        <section class="timetable-period-section">
          <h4 class="timetable-period">${PERIOD_LABELS[period]}</h4>
          <ul class="timetable-times">
            ${groups[period].map(renderTimelineItem).join('')}
          </ul>
        </section>
      `);

    return sections.join('');
  }

  function buildTimelineMarkup(schedule, dayTab) {
    const items = buildTimelineItems(schedule);
    if (!items.length) {
      return buildNoServiceMarkup();
    }

    const useGrouping = dayTab === 'saturday' && !schedule.peakPeriods?.length;
    if (useGrouping) {
      return buildGroupedTimelineMarkup(items);
    }

    return `<ul class="timetable-times">${items.map(renderTimelineItem).join('')}</ul>`;
  }

  function renderTimetable(routeId, dayTab = activeDayTab) {
    const route = ROUTES[routeId];
    if (!route) {
      els.timetableDayContent.innerHTML = '';
      return;
    }

    if (dayTab === 'closed') {
      els.timetableDayContent.innerHTML = buildNoServiceMarkup();
      return;
    }

    const schedule = route[dayTab];
    if (!schedule) {
      els.timetableDayContent.innerHTML = buildNoServiceMarkup();
      return;
    }

    els.timetableDayContent.innerHTML = buildTimelineMarkup(schedule, dayTab);
  }

  function setActiveDayTab(dayTab) {
    activeDayTab = dayTab;
    els.dayTabs.forEach((tab) => {
      const isActive = tab.dataset.day === dayTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    renderTimetable(activeRoute, dayTab);
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
      setActiveDayTab('weekday');
      render();
    });
  });

  els.dayTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveDayTab(tab.dataset.day);
    });
  });

  renderTimetable(activeRoute, activeDayTab);
  render();
  setInterval(render, 1000);
})();
