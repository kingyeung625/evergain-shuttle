/**
 * Hong Kong public holidays (excluding Sundays — handled separately)
 * Sources:
 * - https://www.gov.hk/tc/about/abouthk/holiday/2026.htm
 * - Government gazette announcement for 2027
 */

const PUBLIC_HOLIDAYS = new Set([
  // 2026
  '2026-01-01',
  '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-04-03', '2026-04-04',
  '2026-04-06', '2026-04-07',
  '2026-05-01',
  '2026-05-25',
  '2026-06-19',
  '2026-07-01',
  '2026-09-26',
  '2026-10-01',
  '2026-10-19',
  '2026-12-25', '2026-12-26',

  // 2027
  '2027-01-01',
  '2027-02-06',
  '2027-02-08', '2027-02-09',
  '2027-03-26', '2027-03-27',
  '2027-03-29',
  '2027-04-05',
  '2027-05-01',
  '2027-05-13',
  '2027-06-09',
  '2027-07-01',
  '2027-09-16',
  '2027-10-01',
  '2027-10-08',
  '2027-12-25',
  '2027-12-27',
]);

function isPublicHoliday(dateStr) {
  return PUBLIC_HOLIDAYS.has(dateStr);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUBLIC_HOLIDAYS, isPublicHoliday };
}
