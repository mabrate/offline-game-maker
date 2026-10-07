// Shared, self-contained runtime for the sandboxed preview and HTML exports.
(() => {
  function workerBootstrap(offset, count) {
    const keys = {};
    let commands = [], last = 0;
    function fail(error) {
      const stack = String(error?.stack || '');
      const locations = [...stack.matchAll(/blob:[^\s)]+:(\d+):(\d+)/g)];
      const location = locations.find(m => +m[1] > offset && +m[1] <= offset + count);
      postMessage({error:{name:error?.name || 'Error', message:String(error?.message || error), line:location ? +location[1] - offset : null, column:location ? +location[2] : null}});
    }
    self.addEventListener('unhandledrejection', e => {e.preventDefault();fail(e.reason)});
    const game = {
      width:640, height:480, keys,
      clear(color='#182233'){commands.push(['clear',color])},
      rect(x,y,w,h,color){commands.push(['rect',x,y,w,h,color])},
      circle(x,y,r,color){commands.push(['circle',x,y,r,color])},
      text(text,x,y,size=24,color='white'){commands.push(['text',String(text),x,y,size,color])},
      sprite(name,x,y,w=40,h=40){commands.push(['sprite',name,x,y,w,h])},
      overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y},
      random(min,max){return min+Math.random()*(max-min)},
      log(...args){postMessage({log:args.map(String).join(' ')})},
      start(setup,update,draw){
        try { if(setup)setup();postMessage({ready:true}); }
        catch(error){fail(error);return}
        self.onmessage=e=>{
          if(e.data.keys){Object.assign(keys,e.data.keys);return}
          if(e.data.tick){
            try {
              commands=[];
              const dt=Math.min((e.data.tick-last)/1000,0.05);last=e.data.tick;
              if(update)update(dt);if(draw)draw();postMessage({commands});
            }catch(error){fail(error)}
          }
        };
      }
    };
    console.log=(...args)=>game.log(...args);
    return game;
  }
  function play(project, bootstrap) {
    const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),pictures={};
    let worker, pending=false, ready=false, failed=false, animation=null, disposed=false;
    const count=project.code.split('\n').length;
    const prefix=`const game=(${bootstrap})(OFFSET,${count});\n`;
    const offset=prefix.split('\n').length-1;
    const source=prefix.replace('OFFSET',String(offset))+project.code+'\n;game.start(typeof setup==="function"?setup:null,typeof update==="function"?update:null,typeof draw==="function"?draw:null);';
    function hint(error) {
      if(error.name==='SyntaxError' || /Unexpected|Invalid or unexpected|already been declared/.test(error.message))return 'Check brackets, quotes, commas, and spelling here and on the line just before it.';
      if(/is not defined/.test(error.message))return 'Check the spelling of this name. Declare it with let or const before using it.';
      if(/is not a function/.test(error.message))return 'Check the function name and capitalization. Open Code help for the game commands.';
      if(/Cannot (read|set)|null|undefined/.test(error.message))return 'This value is missing. Check where it is created before using its properties.';
      return 'Read the message, check the indicated line, then change one thing and press Run again.';
    }
    function report(message,error=false,details=null){parent.postMessage({type:'game-log',message,error,details},'*')}
    function fail(details) {
      if(failed)return;failed=true;ready=false;cancelAnimationFrame(animation);worker?.terminate();
      const line=Number.isInteger(details.line)&&details.line>=1&&details.line<=count?details.line:null;
      details={...details,line,hint:hint(details)};
      const heading=line ? `Line ${line}${details.column ? ', column '+details.column : ''}` : 'Game error — location unavailable';
      const message=`${heading}: ${details.message}\n${details.hint}`;
      const el=document.querySelector('#err');el.hidden=false;el.textContent=message;
      report(message,true,details);
    }
    try {
      const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
      worker=new Worker(url);URL.revokeObjectURL(url);
    }catch(error){fail({name:error.name,message:'Could not start the game: '+error.message,line:null});return}
    worker.onerror=e=>{
      e.preventDefault();
      const syntax=/SyntaxError|Unexpected|Invalid/.test(e.message);
      let line=e.lineno-offset;
      // An unfinished student block may be detected at our appended startup line.
      if(syntax && line>count)line=count;
      fail({name:syntax?'SyntaxError':'Error',message:e.message.replace(/^Uncaught (?:\w+Error: )?/,''),line,column:e.colno||null});
    };
    worker.onmessage=e=>{
      const data=e.data;
      if(data.error){fail(data.error);return}
      if(data.log)report(data.log);
      if(data.ready){ready=true;pending=true;worker.postMessage({tick:performance.now()})}
      if(data.commands){
        pending=false;
        try{
          for(const [op,...a] of data.commands){
            if(op==='clear'){ctx.fillStyle=a[0];ctx.fillRect(0,0,640,480)}
            if(op==='rect'){ctx.fillStyle=a[4]||'white';ctx.fillRect(...a.slice(0,4))}
            if(op==='circle'){ctx.fillStyle=a[3]||'white';ctx.beginPath();ctx.arc(a[0],a[1],Math.max(0,a[2]),0,Math.PI*2);ctx.fill()}
            if(op==='text'){ctx.fillStyle=a[4];ctx.font=a[3]+'px system-ui';ctx.fillText(a[0],a[1],a[2])}
            if(op==='sprite'&&pictures[a[0]]?.complete&&pictures[a[0]].naturalWidth)ctx.drawImage(pictures[a[0]],...a.slice(1));
          }
        }catch(error){fail({name:error.name,message:error.message,line:null})}
      }
    };
    for(const asset of project.assets){const img=new Image();img.src=asset.data;pictures[asset.name]=img}
    function key(k,v){if(!failed)worker.postMessage({keys:{[k]:v}})}
    addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();key(e.key,true)});
    addEventListener('keyup',e=>key(e.key,false));
    addEventListener('blur',()=>{for(const k of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '])key(k,false)});
    for(const button of document.querySelectorAll('button')){
      button.onpointerdown=e=>{button.setPointerCapture(e.pointerId);key(button.dataset.key,true)};
      button.onpointerup=button.onpointercancel=()=>key(button.dataset.key,false);
    }
    canvas.onclick=()=>canvas.focus();
    const tick=t=>{if(disposed||failed)return;if(ready&&!pending){pending=true;worker.postMessage({tick:t})}animation=requestAnimationFrame(tick)};
    addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(animation);worker.terminate()});
    animation=requestAnimationFrame(tick);canvas.focus();
  }
  window.makeGameHTML = function(project) {
    const payload=JSON.stringify({code:project.code,assets:project.assets}).replace(/</g,'\\u003c');
    const bootstrap=JSON.stringify(workerBootstrap.toString()).replace(/</g,'\\u003c');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Game</title><style>html,body{margin:0;height:100%;background:#182233;overflow:hidden}canvas{width:100%;height:100%;object-fit:contain;touch-action:none}#err{position:absolute;top:0;left:0;right:0;color:#fff;background:#982f45;padding:14px;white-space:pre-wrap;font:14px/1.6 system-ui}#buttons{position:absolute;bottom:8px;left:8px;right:8px;display:flex;gap:6px}button{background:#ffffff33;color:white;border:1px solid #ffffff55;padding:12px;border-radius:8px}button:last-child{margin-left:auto}</style></head><body><canvas width="640" height="480" tabindex="0"></canvas><div id="err" role="alert" hidden></div><div id="buttons"><button data-key="ArrowLeft">◀</button><button data-key="ArrowUp">▲</button><button data-key="ArrowDown">▼</button><button data-key="ArrowRight">▶</button><button data-key=" ">Action</button></div><script>(${play.toString()})(${payload},${bootstrap});<\/script></body></html>`;
  };
})();
