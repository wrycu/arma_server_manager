/// <reference types="vitest/globals" />
import { formatDateTime, formatDate, formatTime } from './date'

describe('formatDateTime', () => {
  it('includes the year in the formatted output', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDateTime(testDate, 'en-US')

    // Should contain the year "2021"
    expect(formatted).toContain('2021')
  })

  it('formats a date with month, day, year, and time', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDateTime(testDate, 'en-US')

    // Should contain all components
    expect(formatted).toContain('Dec')
    expect(formatted).toContain('30')
    expect(formatted).toContain('2021')
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })

  it('handles dates from different years correctly', () => {
    const oldDate = '2015-01-15T10:30:00Z'
    const recentDate = '2024-06-20T14:45:00Z'

    const formattedOld = formatDateTime(oldDate, 'en-US')
    const formattedRecent = formatDateTime(recentDate, 'en-US')

    expect(formattedOld).toContain('2015')
    expect(formattedRecent).toContain('2024')
  })

  it('respects different locale settings', () => {
    const testDate = '2021-12-30T12:24:00Z'

    const enUS = formatDateTime(testDate, 'en-US')
    const frFR = formatDateTime(testDate, 'fr-FR')
    const deDE = formatDateTime(testDate, 'de-DE')

    // All should include the year
    expect(enUS).toContain('2021')
    expect(frFR).toContain('2021')
    expect(deDE).toContain('2021')

    // French uses different month abbreviation
    expect(frFR).toContain('déc')
    // German uses different format
    expect(deDE).toContain('Dez')
  })
})

describe('formatDate', () => {
  it('includes the year in the formatted output', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDate(testDate, 'en-US')

    expect(formatted).toContain('2021')
  })

  it('formats a date without time', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDate(testDate, 'en-US')

    expect(formatted).toContain('Dec')
    expect(formatted).toContain('30')
    expect(formatted).toContain('2021')
    // Should not contain time components
    expect(formatted).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('respects different locale settings', () => {
    const testDate = '2021-12-30T12:24:00Z'

    const enUS = formatDate(testDate, 'en-US')
    const jaJP = formatDate(testDate, 'ja-JP')

    // Both should include the year
    expect(enUS).toContain('2021')
    expect(jaJP).toContain('2021')

    // Japanese uses different format (year/month/day)
    expect(jaJP).toMatch(/2021/)
  })
})

describe('formatTime', () => {
  it('formats time without date components', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatTime(testDate, 'en-US')

    // Should contain time
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    // Should not contain date components
    expect(formatted).not.toContain('Dec')
    expect(formatted).not.toContain('2021')
  })

  it('respects different locale settings for time format', () => {
    const testDate = '2021-12-30T14:24:00Z'

    const enUS = formatTime(testDate, 'en-US')
    const enGB = formatTime(testDate, 'en-GB')

    // US uses 12-hour format with AM/PM
    expect(enUS).toMatch(/[AP]M/)
    // UK typically uses 24-hour format (though this can vary)
    expect(enGB).toMatch(/\d{1,2}:\d{2}/)
  })
})
