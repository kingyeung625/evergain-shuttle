/**
 * Next shuttle bus calculation logic (Hong Kong time)
 */

const HKT_TIMEZONE = 'Asia/Hong_Kong';

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function getHKTParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: HKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const weekday = get('weekday');
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const second = Number(get('second'));

  return {
    dateStr: `${year}-${month}-${day}`,
    weekday,
    hour,
    minute,
    second,
    totalSeconds: hour * 3600 + minute * 60 + second,
    totalMinutes: hour * 60 + minute,
  };
}

function getDayType(hkt) {
  if (hkt.weekday === 'Sun' || isPublicHoliday(hkt.dateStr)) {
    return 'closed';
  }
  if (hkt.weekday === 'Sat') {
    return 'saturday';
  }
  return 'weekday';
}

function getScheduleForRoute(route, dayType) {
  if (dayType === 'closed') {
    return null;
  }
  if (dayType === 'saturday') {
    return route.saturday ?? null;
  }
  return route.weekday ?? null;
}

function isInPeakPeriod(hkt, peakPeriods) {
  if (!peakPeriods) {
    return null;
  }

  const now = hkt.totalMinutes;
  for (const period of peakPeriods) {
    const start = parseTimeToMinutes(period.start);
    const end = parseTimeToMinutes(period.end);
    if (now >= start && now < end) {
      return period;
    }
  }
  return null;
}

function getUpcomingPeakPeriod(hkt, peakPeriods) {
  if (!peakPeriods) {
    return null;
  }

  const now = hkt.totalMinutes;
  for (const period of peakPeriods) {
    if (parseTimeToMinutes(period.start) > now) {
      return period;
    }
  }
  return null;
}

function getNextFixedDeparture(hkt, fixedTimes) {
  const now = hkt.totalMinutes;
  for (const time of fixedTimes) {
    if (parseTimeToMinutes(time) > now) {
      return time;
    }
    if (parseTimeToMinutes(time) === now && hkt.second === 0) {
      return time;
    }
  }
  return null;
}

function getSecondsUntil(timeStr, hkt) {
  const targetMinutes = parseTimeToMinutes(timeStr);
  let diffSeconds = targetMinutes * 60 - hkt.totalSeconds;
  if (diffSeconds < 0) {
    diffSeconds += 24 * 3600;
  }
  return diffSeconds;
}

function addDaysToDateStr(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekdayFromDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()];
}

function routeOperatesOnDayType(route, dayType) {
  if (dayType === 'closed') {
    return false;
  }
  return route.serviceDays.includes(dayType);
}

function findNextServiceDay(routeId, fromDateStr, maxDays = 14) {
  let dateStr = fromDateStr;
  for (let i = 1; i <= maxDays; i += 1) {
    dateStr = addDaysToDateStr(dateStr, 1);
    const weekday = getWeekdayFromDateStr(dateStr);
    let dayType = 'weekday';
    if (weekday === 'Sun' || isPublicHoliday(dateStr)) {
      dayType = 'closed';
    } else if (weekday === 'Sat') {
      dayType = 'saturday';
    }

    const route = ROUTES[routeId];
    if (routeOperatesOnDayType(route, dayType)) {
      const schedule = getScheduleForRoute(route, dayType);
      const firstBus = schedule?.fixedTimes?.[0] ?? null;
      return { dateStr, dayType, firstBus };
    }
  }
  return null;
}

function getNextBus(routeId, now = new Date()) {
  const route = ROUTES[routeId];
  if (!route) {
    return {
      status: 'closed',
      nextTime: null,
      secondsUntil: null,
      message: 'Unknown route',
      isPeak: false,
    };
  }

  const hkt = getHKTParts(now);
  const dayType = getDayType(hkt);

  if (dayType === 'closed') {
    const next = findNextServiceDay(routeId, hkt.dateStr);
    return {
      status: 'closed',
      nextTime: null,
      secondsUntil: null,
      isPeak: false,
      message: '\u4ECA\u65E5\u4E0D\u8A2D\u7A7F\u68AD\u5DF4\u58EB\u670D\u52D9\uFF08\u661F\u671F\u65E5\u6216\u516C\u773E\u5047\u671F\uFF09',
      nextService: next,
    };
  }

  if (!routeOperatesOnDayType(route, dayType)) {
    const next = findNextServiceDay(routeId, hkt.dateStr);
    return {
      status: 'not_today',
      nextTime: null,
      secondsUntil: null,
      isPeak: false,
      message: '\u6B64\u8DEF\u7DDA\u4ECA\u65E5\u4E0D\u8A2D\u670D\u52D9',
      nextService: next,
    };
  }

  const schedule = getScheduleForRoute(route, dayType);
  const peakPeriod = isInPeakPeriod(hkt, schedule.peakPeriods);

  if (peakPeriod) {
    return {
      status: 'peak',
      nextTime: null,
      secondsUntil: null,
      isPeak: true,
      message: `\u4E0D\u5B9A\u6642\u958B\u8ECA\uFF0C\u7D04 ${peakPeriod.intervalMinutes} \u5206\u9418\u4E00\u73ED`,
    };
  }

  const nextTime = getNextFixedDeparture(hkt, schedule.fixedTimes);
  const upcomingPeak = getUpcomingPeakPeriod(hkt, schedule.peakPeriods);
  if (upcomingPeak) {
    const peakStartMinutes = parseTimeToMinutes(upcomingPeak.start);
    const fixedMinutes = nextTime ? parseTimeToMinutes(nextTime) : Infinity;
    if (peakStartMinutes < fixedMinutes) {
      return {
        status: 'ok',
        nextTime: upcomingPeak.start,
        secondsUntil: getSecondsUntil(upcomingPeak.start, hkt),
        isPeak: false,
        message: `${upcomingPeak.start} \u8D77\u4E0D\u5B9A\u6642\u958B\u8ECA\uFF0C\u7D04 ${upcomingPeak.intervalMinutes} \u5206\u9418\u4E00\u73ED`,
      };
    }
  }

  if (nextTime) {
    const secondsUntil = getSecondsUntil(nextTime, hkt);
    return {
      status: 'ok',
      nextTime,
      secondsUntil,
      isPeak: false,
      message: '\u56FA\u5B9A\u73ED\u6B21',
    };
  }

  const next = findNextServiceDay(routeId, hkt.dateStr);
  return {
    status: 'ended',
    nextTime: null,
    secondsUntil: null,
    isPeak: false,
    message: '\u4ECA\u65E5\u670D\u52D9\u5DF2\u7D50\u675F',
    nextService: next,
  };
}

function formatCountdown(secondsUntil) {
  if (secondsUntil == null) {
    return '';
  }
  const hours = Math.floor(secondsUntil / 3600);
  const mins = Math.floor((secondsUntil % 3600) / 60);
  const secs = secondsUntil % 60;
  if (hours > 0) {
    return `\u9084\u6709 ${hours} \u5C0F\u6642 ${mins} \u5206 ${secs} \u79D2`;
  }
  if (mins > 0) {
    return `\u9084\u6709 ${mins} \u5206 ${secs} \u79D2`;
  }
  return `\u9084\u6709 ${secs} \u79D2`;
}

function formatHKTDateTime(date = new Date()) {
  return new Intl.DateTimeFormat('zh-HK', {
    timeZone: HKT_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getNextBus,
    getHKTParts,
    formatCountdown,
    formatHKTDateTime,
    parseTimeToMinutes,
    getDayType,
  };
}