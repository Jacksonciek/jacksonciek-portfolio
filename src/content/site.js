export const CHAPTERS = [['home', 'Home'], ['education', 'Education'], ['experience', 'Experience'], ['projects', 'Projects'], ['design', 'Design'], ['video', 'Video'], ['contact', 'Contact']]
  .map(([id, name]) => ({ id, name }));
// nav: true = also listed in the pill row and the phone menu
export const PAGES = [['/projects', 'Projects', true], ['/about', 'About', true], ['/ai-lab', 'AI lab', true], ['/design', 'Design'], ['/video', 'Video'], ['/contact', 'Contact']]
  .map(([path, name, nav]) => ({ path, name, nav: !!nav }));
