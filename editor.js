/* Local JavaScript coloring. The textarea remains the native editing surface. */
(() => {
  const input = document.getElementById('code');
  const shell = document.createElement('div');
  shell.className = 'code-editor';
  const gutter = document.createElement('div');
  gutter.className = 'line-gutter';
  gutter.setAttribute('aria-hidden', 'true');
  const numbers = document.createElement('pre');
  gutter.append(numbers);
  const viewport = document.createElement('div');
  viewport.className = 'highlight-viewport';
  viewport.setAttribute('aria-hidden', 'true');
  const highlight = document.createElement('pre');
  highlight.className = 'highlight-code';
  viewport.append(highlight);
  input.replaceWith(shell);
  shell.append(gutter, viewport, input);
  input.wrap = 'off';
  const keywords = new Set('async await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while with yield'.split(' '));
  const literals = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
  // A forgiving lexer colors incomplete code while students type. Never executes it.
  const tokens = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[\s\S]|[^"\\])*"?|'(?:\\[\s\S]|[^'\\])*'?|`(?:\\[\s\S]|[^`\\])*`?|\b(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)\b|[A-Za-z_$][\w$]*|(?:===|!==|=>|==|!=|<=|>=|\+\+|--|&&|\|\||\?\?|[+*%=!<>?:&|~^-])/g;
  const pythonKeywords = new Set('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  const pythonTokens = /#[^\n]*|"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|(?:[fFrRuUbB]{1,2})?"(?:\\[\s\S]|[^"\\\n])*"?|(?:[fFrRuUbB]{1,2})?'(?:\\[\s\S]|[^'\\\n])*'?|\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d*)?)\b|[A-Za-z_][\w]*|(?:==|!=|<=|>=|\*\*|\/\/|[+*%=!<>:&|~^\/-])/g;
  let previous, previousLanguage;
  function syncScroll() {
    highlight.style.transform = `translate(${-input.scrollLeft}px, ${-input.scrollTop}px)`;
    numbers.style.transform = `translateY(${-input.scrollTop}px)`;
  }
  function refresh() {
    const source = input.value;
    const python = input.dataset.language === 'python';
    if (source !== previous || python !== previousLanguage) {
      previous = source;previousLanguage = python;
      const fragment = document.createDocumentFragment();
      let position = 0;
      for (const match of source.matchAll(python ? pythonTokens : tokens)) {
        fragment.append(document.createTextNode(source.slice(position, match.index)));
        const token = match[0];
        let kind = '';
        if (python ? token.startsWith('#') : token.startsWith('//') || token.startsWith('/*')) kind = 'comment';
        else if ((python && /^[fFrRuUbB]{0,2}["']/.test(token)) || /^["'`]/.test(token)) kind = 'string';
        else if (/^\d/.test(token)) kind = 'number';
        else if ((python ? pythonKeywords : keywords).has(token)) kind = 'keyword';
        else if ((python ? new Set(['True','False','None']) : literals).has(token)) kind = 'literal';
        else if (/^[A-Za-z_$]/.test(token)) {
          if (/^\s*\(/.test(source.slice(match.index + token.length))) kind = 'function';
          else if (token === 'game' || token === 'Math' || token === 'console') kind = 'builtin';
        } else kind = 'operator';
        const span = document.createElement('span');
        if (kind) span.className = 'syntax-' + kind;
        span.textContent = token;
        fragment.append(span);
        position = match.index + token.length;
      }
      fragment.append(document.createTextNode(source.slice(position) + '\n'));
      highlight.replaceChildren(fragment);
      const count = source.split('\n').length;
      numbers.textContent = Array.from({length:count}, (_,i) => i + 1).join('\n') + '\n';
      shell.style.setProperty('--gutter-width', `${Math.max(3, String(count).length + 2)}ch`);
    }
    syncScroll();
  }
  input.addEventListener('input', refresh);
  input.addEventListener('scroll', syncScroll);
  window.goToCodeLine = (line, column) => {
    const lines = input.value.split('\n');
    line = Math.max(1, Math.min(lines.length, line));
    const start = lines.slice(0, line - 1).reduce((n, text) => n + text.length + 1, 0);
    input.focus();
    input.setSelectionRange(start, start + lines[line - 1].length);
    const styles = getComputedStyle(input);
    input.scrollTop = Math.max(0, (line - 1) * parseFloat(styles.lineHeight) - input.clientHeight / 3);
    input.scrollLeft = 0;
    syncScroll();
  };
  window.refreshCodeEditor = refresh;
  refresh();
})();
