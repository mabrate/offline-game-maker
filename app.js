'use strict';
// Isolate recovery between separate project sites on the same GitHub Pages origin.
const sitePath=new URL('./',document.currentScript.src).pathname;
const recoveryDatabase=sitePath==='/'?'pixel-workshop':'pixel-workshop:'+sitePath;
const $=id=>document.getElementById(id);
const svg=(body)=>'data:image/svg+xml;base64,'+btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`);
const builtins=[{name:'robot',data:svg('<rect x="12" y="15" width="40" height="40" rx="12" fill="#9c8aff"/><rect x="19" y="24" width="26" height="15" rx="5" fill="#28324a"/><circle cx="26" cy="31" r="3" fill="#baf8e1"/><circle cx="38" cy="31" r="3" fill="#baf8e1"/><path d="M32 15V6M24 46h16" stroke="#d7ceff" stroke-width="4"/>')},{name:'coin',data:svg('<circle cx="32" cy="32" r="25" fill="#ffcd58" stroke="#f4a82f" stroke-width="5"/><path d="M32 15v34M24 21h14M24 43h14" stroke="#fff0ac" stroke-width="5"/>')},{name:'star',data:svg('<path d="m32 5 8 17 19 3-14 14 3 19-16-9-17 9 3-19L4 25l20-3z" fill="#80e4c4"/>')}];
const templates={
pythonQuiz:{title:'Multiplication quiz',language:'python',subtitle:'Python · input · loops · arithmetic',challenge:'Change questions to 10 or increase the largest factor. Add a message for a perfect score.',code:`# A multiplication quiz written in Python.
import random

questions = 5
largest_factor = 12
score = 0

print("MULTIPLICATION QUEST")
print("Answer each question. Type a whole number.")

for question in range(1, questions + 1):
    first = random.randint(1, largest_factor)
    second = random.randint(1, largest_factor)
    print("\\nQuestion", question, "of", questions)

    while True:
        response = input(str(first) + " x " + str(second) + " = ")
        try:
            answer = int(response)
            break
        except ValueError:
            print("Please type a whole number, like 12.")

    if answer == first * second:
        score += 1
        print("Correct! Nice work.")
    else:
        print("Good try! The answer is", first * second)

print("\\nYou scored", score, "out of", questions)
print("Run again for a new challenge!")
`},
collector:{title:'Coin collector',subtitle:'Movement · collisions · score',challenge:'Change the speed from 180 to 300. Then make each coin worth 5 points.',code:`// Collect coins with the arrow keys!\n// game is your small, offline game library.\nlet player = { x: 300, y: 220, w: 40, h: 40 };\nlet coin = { x: 100, y: 120, w: 30, h: 30 };\nlet score = 0;\nlet speed = 180;\n\nfunction update(dt) {\n  if (game.keys.ArrowLeft) player.x -= speed * dt;\n  if (game.keys.ArrowRight) player.x += speed * dt;\n  if (game.keys.ArrowUp) player.y -= speed * dt;\n  if (game.keys.ArrowDown) player.y += speed * dt;\n  player.x = Math.max(0, Math.min(600, player.x));\n  player.y = Math.max(50, Math.min(400, player.y));\n  if (game.overlap(player, coin)) {\n    score += 1;\n    coin.x = game.random(30, 580);\n    coin.y = game.random(70, 390);\n    game.log('Collected! Score: ' + score);\n  }\n}\n\nfunction draw() {\n  game.clear('#182b3b');\n  game.text('COIN COLLECTOR', 24, 36, 20, '#aabed2');\n  game.text('Score: ' + score, 475, 36);\n  game.sprite('coin', coin.x, coin.y, coin.w, coin.h);\n  game.sprite('robot', player.x, player.y, player.w, player.h);\n}`},
bounce:{title:'Bouncing shapes',subtitle:'Variables · animation · conditions',challenge:'Make the ball larger. Can you add a second ball moving in a different direction?',code:`let x = 100, y = 130;\nlet vx = 180, vy = 140;\nlet radius = 24;\n\nfunction update(dt) {\n  x += vx * dt;\n  y += vy * dt;\n  if (x < radius || x > 640 - radius) vx *= -1;\n  if (y < 60 || y > 420 - radius) vy *= -1;\n}\n\nfunction draw() {\n  game.clear('#252342');\n  game.text('BOUNCING IDEAS', 24, 36, 20, '#c9baff');\n  game.circle(x, y, radius, '#9c8aff');\n  game.sprite('star', 280, 200, 70, 70);\n}`},
story:{title:'Interactive story',subtitle:'Input · arrays · decisions',challenge:'Write a new ending. Add another scene to the array and play through your story.',code:`const scenes = [\n  'You discover a tiny robot in the forest.',\n  'It asks you to find a glowing star.',\n  'You follow a trail of golden coins.',\n  'The star lights up. Your adventure begins!'\n];\nlet scene = 0;\nlet held = false;\n\nfunction update(dt) {\n  if (game.keys[' '] && !held) {\n    scene = (scene + 1) % scenes.length;\n  }\n  held = !!game.keys[' '];\n}\n\nfunction draw() {\n  game.clear('#173a36');\n  game.sprite('robot', 270, 110, 100, 100);\n  game.text(scenes[scene], 24, 280, 20, '#e0f6ea');\n  game.text('Space / Action: next scene', 24, 360, 18, '#85c4ae');\n}`},
blank:{title:'Untitled game',subtitle:'A canvas for your own idea',challenge:'Draw a shape, create a variable, then use update(dt) to move it.',code:`function update(dt) {\n  // Change your game state here.\n}\n\nfunction draw() {\n  game.clear('#182233');\n  game.text('Hello, game maker!', 180, 230, 28);\n}\n`}};
let project={format:'pixel-workshop',version:1,title:templates.collector.title,template:'collector',code:templates.collector.code,assets:structuredClone(builtins)},db,saveTimer,dirty=false;
let runningCode = null;
function log(message,error=false,details=null){
  const row=document.createElement('div');row.className=error?'console-error':'console-message';
  if(error&&details?.line){
    const jump=document.createElement('button');jump.className='error-line';jump.textContent='Go to line '+details.line;
    const snapshot=runningCode;
    jump.onclick=()=>{
      if($('code').value!==snapshot){log('Your code has changed since this error. Press Run to get its current line number.');return}
      window.goToCodeLine(details.line,details.column);
    };
    row.append(jump,document.createTextNode(' '+message));
  }else row.textContent=(error?'ERROR: ':'')+message;
  $('log').append(row);$('log').scrollTop=$('log').scrollHeight;
}
function dialog(title,text,actions){$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('dialog-actions').replaceChildren();for(const [label,fn] of actions){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{$('dialog').close();fn()};$('dialog-actions').append(b)}$('dialog').showModal()}
function download(name,content,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function filename(){return project.title.replace(/[^a-z0-9_-]/gi,'-').slice(0,80)||'game'}
function capture(){project.code=$('code').value;project.title=$('title').value||'Untitled game';window.lessonController?.capture(project);window.lessonController?.refreshLocate(project);return project}
function saveProject(){download(filename()+'.gameproject',JSON.stringify(capture(),null,2));dirty=false}
function persist(){window.refreshCodeEditor();capture();dirty=true;$('recovery').textContent='Saving recovery…';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(!db){$('recovery').textContent='Recovery unavailable — download your project.';return}const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(project,'current');tx.oncomplete=()=>{$('recovery').textContent='✓ Recovery saved on this device'};tx.onerror=()=>{$('recovery').textContent='Recovery failed — download your project.'}},350)}
function stop(){window.stopPythonTerminal();$('game').srcdoc='';$('game').style.display='none';$('placeholder').style.display='flex'}
function render(){stop();
  const python=project.language==='python';
  $('code').dataset.language=python?'python':'javascript';
  $('source-name').textContent=python?'main.py':'main.js';$('language-name').textContent=python?'Python':'JavaScript';
  $('project-file').textContent=python?'⌘ main.py':'⌘ main.js';$('preview-name').textContent=python?'Python terminal':'Playground';
  $('asset-shelf').hidden=python;$('stage').hidden=python;$('terminal').hidden=!python;
  document.querySelector('.controls').hidden=python;$('fullscreen').hidden=python;
  $('help').innerHTML=python?pythonHelp:javascriptHelp;
  $('terminal-status').textContent='Press Run to start Python';$('terminal-output').textContent='';
  $('title').value=project.title;$('code').value=project.code;window.refreshCodeEditor();$('challenge-text').textContent=(templates[project.template]||templates.blank).challenge;document.querySelectorAll('.template').forEach(b=>b.classList.toggle('selected',b.dataset.id===project.template));$('assets').replaceChildren();for(const asset of project.assets){const b=document.createElement('button');b.className='asset';const img=document.createElement('img');img.src=asset.data;img.alt='';b.append(img,document.createTextNode(asset.name));b.title='Insert '+asset.name;b.onclick=()=>{const c=$('code');c.setRangeText(JSON.stringify(asset.name),c.selectionStart,c.selectionEnd,'end');c.focus();persist()};$('assets').append(b)}window.lessonController?.render()}
for(const [id,t] of Object.entries(templates)){const b=document.createElement('button');b.className='template';b.dataset.id=id;b.append(document.createTextNode(t.title));const small=document.createElement('small');small.textContent=t.subtitle;b.append(small);b.onclick=()=>dialog('Start a new project?','Download your current work before replacing it.',[['Save current',saveProject],['Cancel',()=>{}],['Start new',()=>{project={format:'pixel-workshop',version:1,title:t.title,template:id,language:t.language||'javascript',code:t.code,assets:t.language==='python'?[]:structuredClone(builtins)};render();persist()}]]);$('templates').append(b)}
$('code').oninput=$('title').oninput=persist;
$('code').onkeydown=e=>{if(e.key==='Tab'){e.preventDefault();const c=e.target;c.setRangeText(project.language==='python'?'    ':'  ',c.selectionStart,c.selectionEnd,'end');persist()}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('run').click()}};
$('run').onclick=()=>{capture();runningCode=project.code;$('log').replaceChildren();if(project.language==='python'){
    startPythonTerminal(project,details=>log((details.line?'Line '+details.line+': ':'')+details.name+': '+details.message+'\n'+details.hint,true,details));
    log('Running '+project.title+'…');return;
  }stop();const old=$('game');const fresh=document.createElement('iframe');fresh.id='game';fresh.title='Game preview';fresh.setAttribute('sandbox','allow-scripts');fresh.style.display='block';fresh.srcdoc=makeGameHTML(project);old.replaceWith(fresh);$('placeholder').style.display='none';log('Running '+project.title+'…')};$('stop').onclick=()=>{stop();$('terminal-status').textContent='Stopped · Press Run to restart';log('Stopped. Your code is still here.')};
addEventListener('message',e=>{if(e.source===$('game').contentWindow&&e.data?.type==='game-log')log(String(e.data.message).slice(0,4000),e.data.error,e.data.details)});
$('save').onclick=saveProject;$('clear').onclick=()=>{$('log').textContent=''};
$('open').onclick=()=>{$('project-input').value='';$('project-input').click()};
function validate(p){window.lessonController?.validate(p);if(p?.language && !['javascript','python'].includes(p.language))throw Error('Unsupported project language.');if(!p||p.format!=='pixel-workshop'||p.version!==1||typeof p.title!=='string'||typeof p.code!=='string'||p.code.length>500000||!Array.isArray(p.assets)||p.assets.length>100)throw Error('This is not a supported Pixel Workshop project.');const names=new Set();for(const a of p.assets){if(!a||typeof a.name!=='string'||!/^[-a-zA-Z0-9_]{1,50}$/.test(a.name)||names.has(a.name)||typeof a.data!=='string'||!/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(a.data))throw Error('The project contains an invalid or duplicate image asset.');names.add(a.name)}return p}
$('project-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('Project exceeds the 20 MB prototype limit.');const incoming=validate(JSON.parse(await file.text()));dialog('Open '+incoming.title+'?','This replaces the current workspace. Save your current project first if you want to keep it.',[['Save current',saveProject],['Cancel',()=>{}],['Open project',()=>{project=incoming;render();persist()}]])}catch(err){dialog('Could not open project',err.message,[['OK',()=>{}]])}};
$('upload').onclick=()=>{$('asset-input').value='';$('asset-input').click()};$('asset-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>2*1024*1024||!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)){dialog('Choose a smaller image','Use PNG, JPEG, WebP or SVG under 2 MB.',[['OK',()=>{}]]);return}if(project.assets.length>=100){log('Asset limit reached.',true);return}let name=file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,40)||'image';const base=name;let i=2;while(project.assets.some(a=>a.name===name))name=base+'_'+i++;const reader=new FileReader();reader.onload=()=>{capture();project.assets.push({name,data:reader.result});render();persist()};reader.readAsDataURL(file)};
$('export').onclick=async()=>{
  capture();const snapshot=structuredClone(project);const name=filename();
  if(snapshot.language==='python'){
    $('export').disabled=true;
    try{const blob=await exportPythonGame(snapshot);download(name+'.zip',blob,'application/zip');log('Exported an offline Python website ZIP, including main.py and the runtime. Unzip and serve it on a static web server.');}
    catch(error){log('Export failed: '+error.message,true)}finally{$('export').disabled=false}
  }else{download(name+'.html',makeGameHTML(snapshot),'text/html');log('Exported a self-contained HTML game. Serve it on your arcade or static website.')}
};
$('fullscreen').onclick=()=>{$('stage').requestFullscreen?.().catch(e=>log(e.message,true))};
const javascriptHelp=`<strong>Your game toolkit</strong><br><code>update(dt)</code> runs each frame. dt is seconds since the last frame.<br><code>draw()</code> draws your game. Clear the canvas first.<br><code>game.clear(color)</code> · <code>game.rect(x,y,w,h,color)</code><br><code>game.circle(x,y,r,color)</code> · <code>game.text(text,x,y,size,color)</code><br><code>game.sprite(name,x,y,w,h)</code> draws an asset from the shelf.<br><code>game.keys.ArrowLeft</code> · <code>game.keys[' ']</code> (Action)<br><code>game.overlap(a,b)</code> checks rectangles with x, y, w, h.<br><code>game.random(min,max)</code> · <code>game.log(message)</code><br>Canvas: 640 × 480. Top-left is (0,0). Ctrl/Cmd + Enter runs your game.<br><strong>Try:</strong> change one value, predict the result, run, and explain what happened.`;
const pythonHelp=`<strong>Python terminal</strong><br>Use <code>print("Hello")</code> for output and <code>input("Your answer: ")</code> to ask a question. Input returns text; <code>int(response)</code> converts it to a whole number.<br>Indent blocks with four spaces. Use <code>for</code>, <code>while</code>, <code>if / else</code>, and <code>try / except</code>. Tab inserts four spaces.<br><code>import random</code> and <code>random.randint(1, 12)</code> choose a number.<br>Errors include a clickable line number. Stop cancels a waiting input or an infinite loop.<br><strong>Runtime:</strong> locally bundled Skulpt Python 3 mode. It supports a teaching subset of Python, not all CPython libraries or robotics hardware. Turtle and sprites are not available in this project type yet.<br>Save project keeps editable work. Export game includes main.py and the offline website runtime.`;
$('help-toggle').onclick=()=>{$('help').hidden=!$('help').hidden};
$('finish').onclick=()=>dialog('Finish this session?','Download your project before clearing recovery from this shared browser.',[['Save project',saveProject],['Cancel',()=>{}],['Clear session',()=>{clearTimeout(saveTimer);stop();if(db){const tx=db.transaction('projects','readwrite');tx.objectStore('projects').delete('current');tx.oncomplete=()=>location.reload();tx.onerror=()=>log('Could not clear recovery. Use browser settings to clear site data.',true)}else location.reload()}]]);
window.lessonController=createLessonController({
  catalog:{pythonQuiz:makeMultiplicationLesson(templates.pythonQuiz.code)},
  getProject:capture,
  writeCode:code=>{stop();$('code').value=code;project.code=code;$('code').scrollTop=0;$('code').scrollLeft=0;window.refreshCodeEditor();$('terminal-output').textContent='';$('terminal-status').textContent='Press Run to try this code';},
  onChange:persist,
  run:()=>$('run').click()
});
render();
const request=indexedDB.open(recoveryDatabase,1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onerror=()=>{$('recovery').textContent='Recovery unavailable — use Save project.'};request.onsuccess=()=>{db=request.result;const get=db.transaction('projects').objectStore('projects').get('current');get.onsuccess=()=>{if(get.result){try{validate(get.result);dialog('Welcome back','A project was recovered on this device.',[['Resume',()=>{project=get.result;render();$('recovery').textContent='✓ Recovered on this device'}],['Download recovery',()=>{download('recovered.gameproject',JSON.stringify(get.result));project=get.result;render()}],['Start fresh',()=>{persist()}]])}catch(err){dialog('Recovery needs attention','Download the saved work before starting fresh.',[['Download saved work',()=>download('recovered.gameproject',JSON.stringify(get.result))],['Start fresh',persist]])}}else $('recovery').textContent='Recovery ready · Save project to keep a copy.'}};
