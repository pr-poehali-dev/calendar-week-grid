export const logPerformance = (label: string, startTime: number) => {
  const duration = performance.now() - startTime;
  if (duration > 100) {
    console.warn(`⚠️ Performance: ${label} took ${duration.toFixed(2)}ms`);
  }
};

export const measureRender = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    return () => logPerformance(`${componentName} render`, start);
  }
  return () => {};
};
