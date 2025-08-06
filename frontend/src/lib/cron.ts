type TimeUnit = 'minutes' | 'hours' | 'days';

export const toCron = (interval: number, unit: TimeUnit): string => {
  const patterns = {
    minutes: `*/${interval} * * * *`,
    hours: `0 */${interval} * * *`,
    days: `0 0 */${interval} * *`,
  };
  return patterns[unit];
};
