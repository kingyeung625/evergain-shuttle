/**
 * Ever Gain Plaza shuttle bus timetables
 * Source: Shuttle bus time table (update as at 12 Oct 2023)
 */

const ROUTES = {
  kwaiFong: {
    id: 'kwaiFong',
    nameZh: '\u8475\u82B3\u6E2F\u9435\u7AD9 \u2194 \u6C38\u5F97\u5229\u5EE3\u5834',
    nameEn: 'Kwai Fong MTR \u2194 Ever Gain Plaza',
    serviceDays: ['weekday', 'saturday'],
    weekday: {
      fixedTimes: [
        '07:15', '07:30', '07:45',
        '09:30', '09:40',
        '09:50', '10:10', '10:30', '10:50', '11:10', '11:30', '11:50',
        '12:00', '12:10', '12:20',
        '14:30', '14:40', '14:50',
        '15:00', '15:20', '15:40', '16:00', '16:20', '16:40',
        '17:00', '17:10', '17:20',
        '19:00', '19:15', '19:30', '19:45', '20:00',
      ],
      peakPeriods: [
        { start: '08:00', end: '09:30', intervalMinutes: 5 },
        { start: '12:30', end: '14:30', intervalMinutes: 5 },
        { start: '17:30', end: '19:00', intervalMinutes: 5 },
      ],
    },
    saturday: {
      fixedTimes: [
        '07:15', '07:30', '07:45',
        '08:00', '08:04', '08:08', '08:12', '08:16', '08:20', '08:24', '08:28',
        '08:32', '08:36', '08:40', '08:44', '08:48', '08:52', '08:56',
        '09:00', '09:10', '09:20', '09:30', '09:40',
        '10:00', '10:20', '10:40',
        '11:00', '11:20', '11:40',
        '12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35',
        '12:40', '12:45', '12:50', '12:55',
        '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35',
        '13:40', '13:45', '13:50', '13:55',
        '14:00', '14:10', '14:20', '14:30',
      ],
    },
  },

  toMeiFooLaiKing: {
    id: 'toMeiFooLaiKing',
    nameZh: '\u6C38\u5F97\u5229\u5EE3\u5834 \u2192 \u7F8E\u5B5A\u53CA\u8354\u666F\u6E2F\u9435\u7AD9',
    nameEn: 'Ever Gain Plaza \u2192 Mei Foo & Lai King MTR',
    serviceDays: ['weekday'],
    weekday: {
      fixedTimes: [
        '17:40', '17:55',
        '18:05', '18:15', '18:25', '18:35', '18:45',
        '18:55',
        '19:10', '19:25',
      ],
    },
  },

  fromMeiFoo: {
    id: 'fromMeiFoo',
    nameZh: '\u7F8E\u5B5A\u6E2F\u9435\u7AD9 \u2192 \u6C38\u5F97\u5229\u5EE3\u5834',
    nameEn: 'Mei Foo MTR \u2192 Ever Gain Plaza',
    serviceDays: ['weekday'],
    weekday: {
      fixedTimes: ['08:10', '08:40'],
    },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROUTES };
}