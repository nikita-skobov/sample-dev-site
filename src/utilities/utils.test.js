/* global expect describe it */
import {
  getDaysAgo,
  getHoursAgo,
  getUpdateString,
  handleErrors,
} from './index'

describe('utility functions', () => {
  describe('handle errors function', () => {
    it('should return the first argument as long as it contains a truthy "ok" property', () => {
      expect(handleErrors({ ok: true })).toEqual({ ok: true })
    })

    it('should throw an error if the ok property is not truthy', () => {
      const func = () => { handleErrors({ ok: 0 }) }
      expect(func).toThrow()
    })
  })

  describe('get hours ago function', () => {
    const today = new Date()
    it('should return a number', () => {
      expect(typeof getHoursAgo(today, today)).toEqual('number')
    })

    it('should return 0 if the dates are the same', () => {
      expect(getHoursAgo(today, today)).toEqual(0)
    })

    it('should return 1 if the second date is an hour ahead of the first', () => {
      const oneHourAgo = new Date(today.getTime() - 3600000)
      expect(getHoursAgo(oneHourAgo, today)).toEqual(1)
    })

    it('should round down to the nearest whole number', () => {
      const oneHourAnd55MinutesAgo = new Date(today.getTime() - 6900000)
      expect(getHoursAgo(oneHourAnd55MinutesAgo, today)).toEqual(1)
    })

    it('should return 25 if the second date is an hour and a day ahead of the first', () => {
      const oneHourAndOneDayAgo = new Date(today.getTime() - 90000000)
      expect(getHoursAgo(oneHourAndOneDayAgo, today)).toEqual(25)
    })
  })

  describe('get days ago function', () => {
    const today = new Date()
    it('should return a number', () => {
      expect(typeof getDaysAgo(today, today)).toEqual('number')
    })

    it('should return 0 if the dates are the same', () => {
      expect(getDaysAgo(today, today)).toEqual(0)
    })

    it('should return 1 if the second date is a day ahead of the first', () => {
      const oneDayAgo = new Date(today.getTime() - 86400000)
      expect(getDaysAgo(oneDayAgo, today)).toEqual(1)
    })

    it('should round down to the nearest whole number', () => {
      const oneDayAnd1MinuteAgo = new Date(today.getTime() - 86460000)
      expect(getDaysAgo(oneDayAnd1MinuteAgo, today)).toEqual(1)
    })

    it('should return 366 if the second date is a year and a day ahead of the first', () => {
      const oneYearAndOneDayAgo = new Date(today.getTime() - 31622400000)
      expect(getDaysAgo(oneYearAndOneDayAgo, today)).toEqual(366)
    })
  })

  describe('get update string function', () => {
    const today = new Date()
    const year = today.getUTCFullYear()
    const month = today.getUTCMonth() + 1
    const paddedMonth = month.toString().length === 1 ? `0${month}` : month
    const day = today.getUTCDate()
    const paddedDay = day.toString().length === 1 ? `0${day}` : day
    const hour = today.getUTCHours()
    const paddedHour = hour.toString().length === 1 ? `0${hour}` : hour
    const minutes = today.getUTCMinutes()
    const paddedMinutes = minutes.toString().length === 1 ? `0${minutes}` : minutes
    const seconds = today.getUTCSeconds()
    const paddedSeconds = seconds.toString().length === 1 ? `0${seconds}` : seconds

    const dateStr = `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMinutes}:${paddedSeconds}Z`
    it('should return a string if given a valid date string', () => {
      expect(typeof getUpdateString(dateStr)).toEqual('string')
    })

    it('should return "0 hours ago" if the date string is close to the current time', () => {
      expect(getUpdateString(dateStr)).toEqual('0 hours ago')
    })
  })
})
