import kb from '../content/kb.json';
import { node, pageHeader, section, badge } from './shared.js';

const STOP = new Set('a an and are as at be by can did do for from how i in is it of on or that the this to what when where which who with you jackson his her their'.split(' '));
const tokens = (text) => text.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 1 && !STOP.has(word)) || [];

function retrieve(question) {
  const query = new Set(tokens(question));
  return kb.map((chunk) => {
    const text = `${chunk.title} ${chunk.text}`, words = tokens(text);
    const score = words.reduce((sum, word) => sum + (query.has(word) ? 1 : 0), 0);
    return { id: chunk.id, title: chunk.title, text: chunk.text.slice(0, 600), score };
  }).sort((a, b) => b.score - a.score).slice(0, 3);
}

export function render() {
  const root = node('div', 'page-ailab');
  root.append(pageHeader('Interactive demo / retrieval augmented generation', 'AI lab', 'Ask a question about Jackson’s education, engineering work, design or toolkit.'));

  const architecture = node('section', 'architecture'); architecture.setAttribute('aria-label', 'AI lab request flow');
  const flow = node('div', 'flow-strip');
  ['Browser', 'Serverless proxy', 'OpenAI API'].forEach((label, i) => {
    const box = node('div', 'flow-node'); box.append(node('span', 'meta', `0${i + 1}`), node('strong', '', label)); flow.append(box);
    if (i < 2) flow.append(node('i', 'flow-link', '→'));
  });
  architecture.append(flow, node('p', 'page-lede', 'The key stays in the server proxy. Set the Cloudflare request limit and an enforced OpenAI monthly spend limit before enabling live answers.'));
  root.append(architecture);

  const ask = section('Ask the portfolio'); ask.classList.add('ask-section');
  const form = node('form', 'ask-form');
  const label = node('label', 'meta', 'Your question'); label.htmlFor = 'portfolio-question';
  const input = node('input', 'ask-input'); input.id = 'portfolio-question'; input.name = 'question'; input.type = 'text'; input.maxLength = 300; input.autocomplete = 'off'; input.placeholder = 'What did Jackson build with RabbitMQ?'; input.required = true;
  const counter = node('span', 'ask-counter', '0 / 300');
  const askButton = node('button', 'btn btn--primary', 'Ask'); askButton.type = 'submit';
  const formTop = node('div', 'ask-form-top'); formTop.append(label, counter);
  form.append(formTop, input, askButton);
  const prompts = node('div', 'ask-prompts'); prompts.setAttribute('aria-label', 'Suggested questions');
  [['RabbitMQ', 'What did Jackson build with RabbitMQ?'], ['Thesis', 'What is Jackson’s thesis about?'], ['Campaigns', 'What results did his campaigns achieve?']].forEach(([tag, question]) => {
    const button = node('button', 'chip ask-prompt', tag); button.type = 'button'; button.addEventListener('click', () => { input.value = question; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }); prompts.append(button);
  });
  const answer = node('article', 'answer-card'); answer.setAttribute('aria-live', 'polite'); answer.setAttribute('aria-atomic', 'true'); answer.append(node('p', 'meta', 'Answer'), node('p', 'answer-text', 'Your answer will appear here.'));
  const retrieved = node('div', 'retrieved'); retrieved.append(node('p', 'meta', 'Retrieved notes'));
  ask.append(form, prompts, answer, retrieved); root.append(ask);

  form.addEventListener('input', () => { counter.textContent = `${input.value.length} / 300`; });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || question.length > 300) return;
    const matches = retrieve(question);
    const text = answer.querySelector('.answer-text');
    retrieved.querySelectorAll('.retrieved-chunk').forEach((el) => el.remove());
    matches.forEach((match) => {
      const item = node('article', 'retrieved-chunk'); item.append(node('strong', '', match.title), node('p', '', match.text)); retrieved.append(item);
    });
    form.setAttribute('aria-busy', 'true'); flow.setAttribute('aria-busy', 'true'); askButton.disabled = true; askButton.textContent = 'Thinking';
    text.textContent = 'Searching the portfolio notes…';
    let result = null;
    try {
      const response = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, chunks: matches.map(({ title, text: body }) => ({ title, text: body })) }) });
      if (response.ok) result = await response.json();
    } catch {}
    if (result?.answer) text.textContent = result.answer;
    else {
      const best = matches[0];
      text.textContent = best?.score ? `${best.text} Showing the best matching note (live model offline).` : 'I could not find a matching note in the portfolio content. Showing the best matching note (live model offline).';
    }
    form.removeAttribute('aria-busy'); flow.removeAttribute('aria-busy'); askButton.disabled = false; askButton.textContent = 'Ask';
  });

  const demo = section('How the portfolio demo works'); demo.classList.add('rag-explainer');
  const steps = node('div', 'rag-steps');
  [['01', 'Portfolio notes', 'Short, curated facts in kb.json.'], ['02', 'Browser retrieval', 'The three notes with the most shared terms.'], ['03', 'Model response', 'A serverless request with a private API key.']].forEach(([n, title, description]) => {
    const item = node('article', 'rag-step'); item.append(node('span', 'meta', n), node('h3', '', title), node('p', '', description)); steps.append(item);
  });
  demo.append(steps, node('div', 'slot', 'Architecture diagram and project screencast can be added here.'));
  if (import.meta.env.DEV) demo.append(badge('Confirm NDA clearance before showing internship project material'));
  root.append(demo);
  return root;
}
