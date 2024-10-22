import { differenceInYears, isBefore, parseISO } from 'date-fns'

export function calculateAge(birthday: string): number {
  const today = new Date()
  const birthDay = parseISO(birthday)

  // 현재 연도와 생일 연도의 차이
  let age = differenceInYears(today, birthDay)

  const thisYearBirthday = new Date(today.getFullYear(), birthDay.getMonth(), birthDay.getDate())

  if (isBefore(today, thisYearBirthday)) {
    age--
  }

  return age
}
