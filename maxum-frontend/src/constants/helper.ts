export const CustomThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    interval: number,
  ) => {
    let lastCallTime = 0;
  
    return function (...args: Parameters<T>) {
      const now = new Date().getTime();
      if (now - lastCallTime >= interval) {
        lastCallTime = now;
        callback(...args);
      }
    };
  };