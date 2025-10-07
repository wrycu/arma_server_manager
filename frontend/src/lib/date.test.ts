/// <reference types="vitest/globals" />
import { formatDateTime, formatDate, formatTime } from './date'

describe('formatDateTime', () => {
  it('includes the year in the formatted output', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDateTime(testDate)

    // Should contain the year "2021"
    expect(formatted).toContain('2021')
  })

  it('formats a date with month, day, year, and time', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDateTime(testDate)

    // Should contain all components
    expect(formatted).toContain('Dec')
    expect(formatted).toContain('30')
    expect(formatted).toContain('2021')
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })

  it('handles dates from different years correctly', () => {
    const oldDate = '2015-01-15T10:30:00Z'
    const recentDate = '2024-06-20T14:45:00Z'

    const formattedOld = formatDateTime(oldDate)
    const formattedRecent = formatDateTime(recentDate)

    expect(formattedOld).toContain('2015')
    expect(formattedRecent).toContain('2024')
  })
})

describe('formatDate', () => {
  it('includes the year in the formatted output', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDate(testDate)

    expect(formatted).toContain('2021')
  })

  it('formats a date without time', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatDate(testDate)

    expect(formatted).toContain('Dec')
    expect(formatted).toContain('30')
    expect(formatted).toContain('2021')
    // Should not contain time components
    expect(formatted).not.toMatch(/\d{1,2}:\d{2}/)
  })
})

describe('formatTime', () => {
  it('formats time without date components', () => {
    const testDate = '2021-12-30T12:24:00Z'
    const formatted = formatTime(testDate)

    // Should contain time
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    // Should not contain date components
    expect(formatted).not.toContain('Dec')
    expect(formatted).not.toContain('2021')
  })
})
