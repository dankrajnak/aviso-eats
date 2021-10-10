export const getStartOfDayEST = () =>
  Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24)) *
    1000 *
    60 *
    60 *
    24 -
  1000 * 60 * 60 * (24 - 5);
