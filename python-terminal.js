(() => {
  const assetBase=new URL('./', document.currentScript.src);
  let worker=null;
  const el=id=>document.getElementById(id);
  function append(text) {
    const output=el('terminal-output');
    // Bound visible output so a printing loop cannot exhaust the page.
    output.textContent=(output.textContent+text).slice(-60000);
    output.scrollTop=output.scrollHeight;
  }
  function disableInput(){el('terminal-form').hidden=true;el('terminal-input').disabled=true}
  window.stopPythonTerminal=()=>{worker?.terminate();worker=null;disableInput()};
  window.startPythonTerminal=(project,onError=()=>{})=>{
    window.stopPythonTerminal();el('terminal-output').textContent='';el('terminal-status').textContent='Loading local Python…';
    const current=new Worker(new URL('python-worker.js', assetBase));worker=current;
    const fail=details=>{
      if(worker!==current)return;
      append(`\n${details.line?'Line '+details.line+': ':''}${details.name}: ${details.message}\n${details.hint}\n`);
      el('terminal-status').textContent='Fix the error, then Run again';onError(details);window.stopPythonTerminal();
    };
    current.onerror=e=>{e.preventDefault();fail({name:'Runtime error',message:'Could not run Python. Check that the local runtime files are installed.',line:null,hint:'Reload the page, or ask your teacher to check the installation.'})};
    current.onmessage=e=>{
      if(worker!==current)return;
      const data=e.data;
      if(data.type==='ready')el('terminal-status').textContent='Running Python';
      if(data.type==='output')append(data.text);
      if(data.type==='input'){
        append(data.prompt);el('terminal-status').textContent='Waiting for your answer';
        el('terminal-form').hidden=false;el('terminal-input').disabled=false;el('terminal-input').value='';el('terminal-input').focus();
      }
      if(data.type==='done'){el('terminal-status').textContent='Finished · Run to play again';window.stopPythonTerminal()}
      if(data.type==='error')fail(data.details);
    };
    el('terminal-form').onsubmit=e=>{
      e.preventDefault();if(worker!==current||el('terminal-input').disabled)return;
      const value=el('terminal-input').value;append(value+'\n');disableInput();el('terminal-status').textContent='Running Python';current.postMessage({type:'answer',value});
    };
    current.postMessage({type:'run',code:project.code});
  };
  window.exportPythonGame=async(project)=>{
    const zip=new JSZip();
    const files=['python-worker.js','python-terminal.js','terminal.css','vendor/skulpt/skulpt.min.js','vendor/skulpt/skulpt-stdlib.js','vendor/skulpt/LICENSE'];
    const results=await Promise.all(files.map(async name=>{const response=await fetch(new URL(name, assetBase));if(!response.ok)throw Error('Missing export file: '+name);return [name,await response.text()]}));
    for(const [name,text] of results)zip.file(name,text);
    const payload=JSON.stringify({code:project.code}).replace(/</g,'\\u003c');
    zip.file('index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Python terminal game</title><link rel="stylesheet" href="terminal.css"></head><body class="terminal-export"><h1 id="title"></h1><button id="run">Run again</button><button id="stop">Stop</button><section id="terminal"><div id="terminal-status" role="status"></div><pre id="terminal-output" role="log" aria-label="Python terminal output"></pre><form id="terminal-form" hidden><label for="terminal-input">Your answer</label><div><input id="terminal-input" autocomplete="off" disabled><button>Enter ↵</button></div></form></section><script src="python-terminal.js"></script><script>const project=${payload};document.getElementById('title').textContent=${JSON.stringify(project.title).replace(/</g,'\\u003c')};document.getElementById('run').onclick=()=>startPythonTerminal(project);document.getElementById('stop').onclick=()=>{stopPythonTerminal();document.getElementById('terminal-status').textContent='Stopped'};startPythonTerminal(project);<\/script></body></html>`);
    zip.file('main.py',project.code);
    zip.file('README.txt','Serve this folder on a static website or classroom arcade web server. For a local test: python3 -m http.server 8080, then open http://localhost:8080. No internet needed. Do not open index.html directly: browsers require HTTP for workers. Python runs in the browser using bundled Skulpt 1.2.0 Python 3 mode. This is not full CPython.');
    return zip.generateAsync({type:'blob'});
  };
})();
