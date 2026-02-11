const queueMap = new Map<string, Promise<void>>();

export const enqueueTask = (key: string, task: () => Promise<void>) => {
  const previous = queueMap.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);

  queueMap.set(
    key,
    next.finally(() => {
      if (queueMap.get(key) === next) {
        queueMap.delete(key);
      }
    })
  );

  return next;
};
