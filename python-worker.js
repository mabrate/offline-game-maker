/* Python runs on the student's device; input suspends this worker, not the editor. */
importScripts('vendor/skulpt/skulpt.min.js', 'vendor/skulpt/skulpt-stdlib.js');
let answer, output='', outputTimer;
function flush(){clearTimeout(outputTimer);outputTimer=null;if(output){postMessage({type:'output',text:output});output=''}}
function write(text){output=(output+text).slice(-60000);if(!outputTimer)outputTimer=setTimeout(flush,16)}
function errorDetails(error) {
  const frames=error.traceback||[];
  const location=frames.find(f=>f.filename==='main.py'||f.filename==='<stdin>')||frames[0];
  const name=error.tp$name||error.name||'Python error';
  const message=error.args?.v?.map(v=>v.v??String(v)).join(' ')||String(error);
  let hint='Check this line, change one thing, and press Run again.';
  if(name==='NameError')hint='Check the spelling of the name and assign it a value before using it.';
  if(name==='SyntaxError'||name==='IndentationError')hint='Check the colon, brackets, quotes, and indentation here and on the line before it.';
  if(name==='ValueError')hint='Check the input value. int() needs a whole number; use try / except to handle other answers.';
  if(name==='TypeError')hint='Check the types of your values. input() returns text; convert it before doing arithmetic.';
  if(name==='ZeroDivisionError')hint='The divisor is zero. Check its value before dividing.';
  return {name,message,line:location?.lineno||null,column:location?.colno!=null?location.colno+1:null,hint};
}
onmessage=e=>{
  if(e.data.type==='answer'){if(answer){const resolve=answer;answer=null;resolve(e.data.value)}return}
  if(e.data.type!=='run')return;
  Sk.configure({__future__:Sk.python3,output:write,inputfunTakesPrompt:true,
    inputfun:prompt=>new Promise(resolve=>{answer=resolve;flush();postMessage({type:'input',prompt:String(prompt)})}),
    read:path=>{if(!Object.prototype.hasOwnProperty.call(Sk.builtinFiles.files,path))throw Error('Module is not bundled: '+path);return Sk.builtinFiles.files[path]},
    // A teacher can stop any loop by terminating the worker.
    execLimit:Infinity, yieldLimit:100
  });
  postMessage({type:'ready'});
  Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody('main',false,e.data.code,true)).then(()=>{flush();postMessage({type:'done'})},error=>{flush();postMessage({type:'error',details:errorDetails(error)})});
};
