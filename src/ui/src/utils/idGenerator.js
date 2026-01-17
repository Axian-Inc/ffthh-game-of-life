let counter = 0;

const generateId = () => {
  counter += 1;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${time}-${rand}-${counter.toString(36)}`;
};

export { generateId };
