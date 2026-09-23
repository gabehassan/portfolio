// Project page demos: video autoplay, the JustMonitors Discord replay,
// and the Squarespace checkout replay.
const initDemos = () => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  // Runs `fn` the first time `node` is mostly on screen
  const onFirstView = (node, fn, threshold = 0.45) => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    }, { threshold });
    io.observe(node);
  };

  // ---------------------------------------------------------------- Videos
  // Play only while visible; a Pause/Play button covers WCAG 2.2.2.
  document.querySelectorAll('video[data-autoplay]').forEach((video) => {
    const btn = video.parentElement.querySelector('.vid-toggle');
    let userPaused = reduceMotion;
    const sync = () => {
      if (!btn) return;
      btn.textContent = video.paused ? 'Play' : 'Pause';
      btn.toggleAttribute('data-paused', video.paused);
      if (btn.dataset.what) btn.setAttribute('aria-label', `${btn.textContent} ${btn.dataset.what}`);
    };
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        userPaused = !video.paused;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
      });
    }
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused) {
        video.preload = 'auto';
        video.play().catch(() => {});
      } else if (!entry.isIntersecting && !video.paused) {
        video.pause();
      }
    }, { threshold: 0.35 }).observe(video);
  });

  // ---------------------------------------------------------- JustMonitors
  // Message shapes and bot replies mirror the 2020-21 source (utils/embeds.js,
  // utils/discordCompanion.js). Accounts and tweets are made up.
  const jm = document.querySelector('[data-demo="justmonitors"]');
  if (jm) {
    const log = jm.querySelector('.dc-log');
    const typed = jm.querySelector('.typed');
    const placeholder = jm.querySelector('.ph');
    const controls = document.querySelector('[data-controls="justmonitors"]');
    const buttons = [...controls.querySelectorAll('button')];
    const state = { accounts: ['demo_restocks', 'demo_kicks'], delay: 500, busy: false, tweet: 0 };
    const people = {
      demo_restocks: { name: 'Demo Restocks', followers: 48210 },
      demo_kicks: { name: 'Demo Kicks', followers: 12877 },
      demo_drops: { name: 'Demo Drops', followers: 3094 },
    };
    const tweets = [
      { handle: 'demo_restocks', text: 'Early link, live at 10 ET', url: 'https://shop.example/p/court-low', app: 'TweetDeck' },
      { handle: 'demo_drops', text: 'Raffle is open for the next hour', url: 'https://raffle.example/enter', app: 'Twitter Web App' },
      { handle: 'demo_kicks', text: 'Loaded more sizes', url: 'https://shop.example/p/runner-og', app: 'Twitter for iPhone' },
      { handle: 'demo_restocks', text: 'Second wave dropping now', url: 'https://shop.example/p/trail-mid', app: 'TweetDeck' },
    ];
    const clock = (d, secs) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', ...(secs ? { second: '2-digit' } : {}) });
    // The seeded messages say 4:02 PM, so new ones continue from there instead of the visitor's clock
    const opened = Date.now();
    const demoNow = () => new Date(new Date().setHours(16, 2, 30, 0) + (Date.now() - opened));

    const message = (who) => {
      const row = el('div', 'dc-msg');
      const av = el('div', 'dc-av');
      if (who === 'gabe') {
        const img = el('img');
        img.src = 'https://gabehassan.com/media/img/gabe-hassan-240.webp';
        img.alt = '';
        img.width = img.height = 40;
        av.append(img);
      } else {
        av.style.background = '#bf5226';
        av.textContent = 'JM';
      }
      const body = el('div');
      const meta = el('div', 'dc-meta');
      meta.append(el('span', 'dc-name', who === 'gabe' ? 'gabe' : who));
      if (who !== 'gabe') meta.append(el('span', 'dc-tag', 'APP'));
      meta.append(el('span', 'dc-time', `Today at ${clock(demoNow())}`));
      body.append(meta);
      row.append(av, body);
      return { row, body };
    };
    const post = (row) => {
      log.append(row);
      while (log.children.length > 10) log.firstElementChild.remove();
    };
    // Links in the replay are illustrations, so they're styled text rather than anchors
    const link = (text) => el('span', 'dc-link', text);
    const listEmbed = () => {
      const embed = el('div', 'dc-embed');
      const desc = el('div', 'dc-embed-desc');
      if (!state.accounts.length) desc.textContent = 'List is empty';
      state.accounts.forEach((acct, i) => {
        if (i) desc.append('\n');
        desc.append(link(acct));
      });
      embed.append(desc);
      return embed;
    };
    const tweetEmbed = (t) => {
      const who = people[t.handle];
      const embed = el('div', 'dc-embed');
      const author = el('div', 'dc-embed-author');
      author.append(el('i'), `${who.name} ◦ ${who.followers} followers`);
      const fields = el('div', 'dc-fields');
      const links = el('div', 'dc-field');
      links.append(el('b', null, 'Links'), link('(t.co)'), ` - ${t.url}`);
      const shortcuts = el('div', 'dc-field');
      shortcuts.append(el('b', null, 'Shortcuts'), link('Likes'), ' - ', link('Profile'), ' - ', link('Following'));
      fields.append(links, shortcuts);
      const foot = el('div', 'dc-embed-foot');
      foot.append(el('i'), `JustMonitors • ${t.app} • ${clock(demoNow(), true)}`);
      embed.append(author, el('div', 'dc-embed-title', `Tweet From @${t.handle}`), el('div', 'dc-embed-desc', `${t.text} ${t.url}`), fields, foot);
      return embed;
    };
    const reply = (cmd) => {
      const [name, arg] = cmd.slice(1).split(/ +/);
      const { row, body } = message('JustMonitors');
      if (name === 'add') {
        if (state.accounts.includes(arg)) body.append(el('div', 'dc-text', 'Account already exists, @gabe!'));
        else { state.accounts.push(arg); body.append(listEmbed()); }
      } else if (name === 'remove') {
        state.accounts = state.accounts.filter((a) => a !== arg);
        body.append(listEmbed());
      } else if (name === 'list') {
        body.append(listEmbed());
      } else if (name === 'delay') {
        body.append(el('div', 'dc-text', `Current delay: ${state.delay}ms`));
      } else if (name === 'setdelay') {
        state.delay = parseInt(arg, 10);
        body.append(el('div', 'dc-text', `Delay has been set to: ${arg}ms`));
      }
      post(row);
    };
    const newTweet = () => {
      const pool = tweets.filter((t) => state.accounts.includes(t.handle));
      if (!pool.length) return;
      const t = pool[state.tweet++ % pool.length];
      const { row, body } = message('JustMonitors | Twitter');
      body.append(tweetEmbed(t));
      post(row);
    };
    const type = async (text) => {
      placeholder.hidden = true;
      typed.textContent = '';
      const caret = el('span', 'caret');
      typed.after(caret);
      for (const ch of text) {
        typed.textContent += ch;
        await sleep(reduceMotion ? 0 : 38 + Math.random() * 40);
      }
      await sleep(reduceMotion ? 0 : 260);
      caret.remove();
      typed.textContent = '';
      placeholder.hidden = false;
    };
    const run = async (cmd) => {
      if (state.busy) return;
      state.busy = true;
      // aria-disabled rather than disabled, so keyboard focus stays on the button
      buttons.forEach((b) => b.setAttribute('aria-disabled', 'true'));
      if (cmd === 'tweet') {
        await sleep(reduceMotion ? 0 : 250);
        newTweet();
      } else {
        await type(cmd);
        const { row, body } = message('gabe');
        body.append(el('div', 'dc-text', cmd));
        post(row);
        await sleep(reduceMotion ? 0 : 420);
        reply(cmd);
      }
      // The add button flips to remove once the account is tracked
      const toggle = controls.querySelector('[data-cmd$="demo_drops"]');
      const tracked = state.accounts.includes('demo_drops');
      toggle.dataset.cmd = toggle.textContent = `${tracked ? '.remove' : '.add'} demo_drops`;
      buttons.forEach((b) => b.removeAttribute('aria-disabled'));
      state.busy = false;
    };
    controls.hidden = false;
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cmd]');
      if (btn) run(btn.dataset.cmd);
    });
    if (!reduceMotion) {
      onFirstView(jm, async () => {
        await sleep(700);
        await run('.setdelay 500');
        await sleep(1400);
        await run('tweet');
      });
    }
  }

  // ------------------------------------------------------- Checkout replay
  const term = document.querySelector('[data-demo="checkout"]');
  if (term) {
    const body = term.querySelector('.term-body');
    const controls = document.querySelector('[data-controls="checkout"]');
    const again = controls.querySelector('[data-run]');
    const total = controls.querySelector('[data-total]');
    const script = [...body.children].map((line) => ({
      cls: line.className,
      t: parseFloat(line.querySelector('.t').textContent) || 0,
      text: line.querySelector('.m').textContent,
      prompt: line.classList.contains('prompt'),
    }));
    const line = (cls, t, text) => {
      const row = el('div', cls);
      row.append(el('span', 't', t), el('span', 'm', text));
      body.append(row);
      return row;
    };
    let running = false;
    const replay = async () => {
      if (running) return;
      running = true;
      again.setAttribute('aria-disabled', 'true');
      // Screen readers get the finished log once, not every typed character and timer tick
      body.setAttribute('aria-busy', 'true');
      body.textContent = '';
      // Each step gets its own jitter so reruns land in the usual 2 to 5 second band
      const scale = 0.9 + Math.random() * 0.35;
      const times = script.map((s) => s.t * scale);
      const prompt = script.find((s) => s.prompt);
      const promptRow = line(prompt.cls, '', '');
      const caret = el('span', 'term-cursor');
      promptRow.querySelector('.m').after(caret);
      for (const ch of prompt.text) {
        promptRow.querySelector('.m').textContent += ch;
        await sleep(reduceMotion ? 0 : 55);
      }
      await sleep(reduceMotion ? 0 : 380);
      caret.remove();
      const start = performance.now();
      const tick = () => {
        if (!running) return;
        total.textContent = `${((performance.now() - start) / 1000).toFixed(2)}s`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      for (let i = 0; i < script.length; i++) {
        const s = script[i];
        if (s.prompt) continue;
        const wait = times[i] * 1000 - (performance.now() - start);
        if (wait > 0) await sleep(wait);
        line(s.cls, `${times[i].toFixed(2)}s`, s.text);
      }
      running = false;
      total.textContent = `${times[times.length - 1].toFixed(2)}s`;
      line('term-line prompt', '', '').append(el('span', 'term-cursor'));
      body.removeAttribute('aria-busy');
      again.removeAttribute('aria-disabled');
    };
    controls.hidden = false;
    again.addEventListener('click', replay);
    if (!reduceMotion) onFirstView(term, replay, 0.5);
  }
};

// Pages prerendered on hover intent would otherwise play their demos unseen
if (document.prerendering) document.addEventListener('prerenderingchange', initDemos, { once: true });
else initDemos();
