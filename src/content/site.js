import { NAV_ITEMS } from '../config.js';

export { NAV_ITEMS };
export const CHAPTERS = NAV_ITEMS.filter((item) => item.target)
  .map(({ target: id, label: name }) => ({ id, name }));
