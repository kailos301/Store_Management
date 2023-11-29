export enum DayType {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  TOMORROW = 'TOMORROW',
  DEFAULT = 'DEFAULT',
}

export class Utils {

  // returns ISO date string of day start from input date string
  public static getDayStart(inputDateStr: string) {
    const inputDate = new Date(inputDateStr);

    const startDate = new Date(inputDate);
    startDate.setHours(0, 0, 0, 0);

    return startDate.toISOString();
  }

  // returns ISO date string of day end from input date string
  public static getDayEnd(inputDateStr: string) {
    const inputDate = new Date(inputDateStr);

    const endDate = new Date(inputDate);
    endDate.setHours(23, 59, 59, 999);

    return endDate.toISOString();
  }

  public static dayCheck(inputDateStr: string) {
    const inputDate = new Date(inputDateStr);
    const inputDateYMD = inputDate.getFullYear() + '-' + (inputDate.getMonth() + 1) + '-' + inputDate.getDate();

    const today = new Date();
    const todayYMD = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYMD = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1) + '-' + yesterday.getDate();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowYMD = tomorrow.getFullYear() + '-' + (tomorrow.getMonth() + 1) + '-' + tomorrow.getDate();

    if (inputDateYMD === todayYMD) {
      return DayType.TODAY;
    } else if (inputDateYMD === yesterdayYMD) {
      return DayType.YESTERDAY;
    } else if (inputDateYMD === tomorrowYMD) {
      return DayType.TOMORROW;
    } else {
      return DayType.DEFAULT;
    }
  }

  /* Note: this is not SMART function
  ** returns '01' from 1, assumes input is in range of 0 ~ 59
  */
  public static padNumber(value) {
    const valueStr = value.toString();
    if (valueStr.length > 1) {
        return valueStr;
    }
    return `0${valueStr}`;
  }

  public static isDateLimitValid(input: Date, min: Date, max: Date = null) {
    const inputTime = input.getTime();
    const minTime = min.getTime();
    if (max) {
      const maxTime = max.getTime();
      if (inputTime > minTime) {
        return (inputTime < maxTime);
      } else {
        return false;
      }
    } else {
      return (inputTime > minTime);
    }
  }
}
