const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace dark mode specific hardcoded colors with CSS variables
css = css.replace(/background:\s*#18181b;?/g, 'background: var(--surface-strong);');
css = css.replace(/background:\s*#27272a;?/g, 'background: var(--surface);');
css = css.replace(/background:\s*#1f2028;?/g, 'background: var(--surface);');
css = css.replace(/background:\s*rgba\(17,\s*24,\s*39,\s*0\.98\);?/g, 'background: var(--surface);');

css = css.replace(/border(-[a-z]+)?:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.1[02]?\);?/g, 'border$1: 1px solid var(--border);');
css = css.replace(/border(-[a-z]+)?:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.0[58]\);?/g, 'border$1: 1px solid var(--border-transparent);');

css = css.replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.[01][0-9]\);?/g, 'background: var(--surface-muted);');

// Change text colors that are hardcoded to #fff or #ffffff (only when they're general text, not on accent backgrounds)
// Actually, it's safer to target specific classes for text color, let's leave color: #fff alone and fix it manually if needed.
// Wait, the date picker needs it.
css = css.replace(/\.dropdown-item \{\s*[\s\S]*?color:\s*#e4e4e7;?/g, (match) => match.replace('color: #e4e4e7;', 'color: var(--text);'));

css = css.replace(/\.picker-month-btn \{\s*[\s\S]*?color:\s*#fff;?/g, (match) => match.replace('color: #fff;', 'color: var(--text);'));
css = css.replace(/\.picker-month-btn:hover \{\s*[\s\S]*?color:\s*#fff;?/g, (match) => match.replace('color: #fff;', 'color: var(--text);'));

css = css.replace(/\.picker-day:not\(\.empty\):hover \{\s*[\s\S]*?color:\s*#fff;?/g, (match) => match.replace('color: #fff;', 'color: var(--text);'));

// The app shell settings active content override
css = css.replace(/\.app-shell\.settings-active \.content {\s*background: var\(--surface-strong\);\s*}/g, '');

fs.writeFileSync('src/index.css', css);
console.log('Replaced colors');
