import { describe, it, expect } from "vitest"
import { toCron } from "./cron"

describe("toCron", () => {
  it('converts "Every 5 minutes" to correct cron expression', () => {
    expect(toCron(5, "minutes")).toBe("*/5 * * * *")
  })

  it('converts "Every 3 hours" to correct cron expression', () => {
    expect(toCron(3, "hours")).toBe("0 */3 * * *")
  })

  it('converts "Every 1 day" to correct cron expression', () => {
    expect(toCron(1, "days")).toBe("0 0 */1 * *")
  })
})
