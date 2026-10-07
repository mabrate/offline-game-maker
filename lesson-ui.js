/* Lesson examples and drafts are isolated behind a saved student-code checkpoint. */
window.createLessonController = function({catalog,getProject,writeCode,onChange,run}) {
  const root=document.getElementById('lesson-panel');
  function lessonFor(project){return project.language==='python'?catalog[project.template]:null}
  function stateFor(project,lesson){
    if(!project.lesson)project.lesson={version:1,buildRevision:2,id:lesson.id,path:null,index:0,loadedStep:null,drafts:{},checkpoint:null,undoCode:null};
    migrateBuildSteps(project.lesson);
    return project.lesson;
  }
  // Inserting the variables step must not attach older drafts to different lessons.
  function migrateBuildSteps(state){
    if(!state||state.buildRevision===2)return;
    const remap=k=>{
      const match=/^build:([3-5])$/.exec(k);
      return match?'build:'+(Number(match[1])+1):k;
    };
    state.drafts=Object.fromEntries(Object.entries(state.drafts).map(([k,v])=>[remap(k),v]));
    if(state.path==='build'&&state.index>=3)state.index+=1;
    if(state.loadedStep)state.loadedStep=remap(state.loadedStep);
    state.buildRevision=2;
  }
  function button(label,action,className=''){
    const b=document.createElement('button');b.type='button';b.textContent=label;b.className=className;b.onclick=action;return b;
  }
  function text(tag,content,className=''){
    const el=document.createElement(tag);el.textContent=content;el.className=className;return el;
  }
  function key(state){return state.path+':'+state.index}
  function checkpoint(project,state){if(state.checkpoint===null)state.checkpoint={code:project.code,title:project.title.slice(0,80)}}
  function saveAndRender(){onChange();render()}
  function replaceCode(project,state,code,loadedStep=null){
    state.undoCode=state.loadedStep===loadedStep?project.code:null;state.loadedStep=loadedStep;
    writeCode(code);saveAndRender();
  }
  function capture(project){
    const lesson=lessonFor(project),state=project.lesson;
    if(lesson&&state){migrateBuildSteps(state);if(state.loadedStep)state.drafts[state.loadedStep]=project.code;}
  }
  function menu(label,id){
    const details=document.createElement('details');details.className='dropdown';details.id=id;
    details.append(text('summary',label+' ▾'));
    const items=document.createElement('div');items.className='dropdown-items';details.append(items);
    return {details,items};
  }
  function backToCode(){
    const project=getProject(),lesson=lessonFor(project),state=stateFor(project,lesson),saved=state.checkpoint;
    if(!saved)return;
    state.path=null;state.index=0;state.loadedStep=null;state.checkpoint=null;
    state.undoCode=null;
    document.getElementById('title').value=saved.title;
    writeCode(saved.code);saveAndRender();
  }
  function render(){
    const project=getProject(),lesson=lessonFor(project);
    root.hidden=!lesson;root.replaceChildren();
    if(!lesson){document.body.classList.remove('lesson-active');return;}
    const state=stateFor(project,lesson),path=lesson.paths.find(p=>p.id===state.path);
    document.body.classList.toggle('lesson-active',!!path);
    const tools=document.createElement('div');tools.className='lesson-toolbar';
    const learn=menu('Learn','learn-menu');
    for(const kind of ['route','skill']){
      learn.items.append(text('span',kind==='route'?'Lesson paths':'Key skills','menu-label'));
      for(const option of lesson.paths.filter(p=>p.kind===kind)){
        const b=button(option.label,()=>{
          const project=getProject(),state=stateFor(project,lesson);
          checkpoint(project,state);state.path=option.id;state.index=0;
          replaceCode(project,state,state.drafts[key(state)]??option.steps[0].code,key(state));
        });b.dataset.path=option.id;learn.items.append(b);
      }
    }
    tools.append(learn.details);
    const codeMenu=menu('Lesson code','lesson-code-menu');
    if(path){
      const step=path.steps[state.index];
      const load=button(state.drafts[key(state)]?'Resume this step':'Load this step',()=>{
        const project=getProject(),state=stateFor(project,lesson);checkpoint(project,state);
        replaceCode(project,state,state.drafts[key(state)]??step.code,key(state));run();
      });load.id='lesson-load';codeMenu.items.append(load);
      const fresh=button('Use fresh example',()=>{
        const project=getProject(),state=stateFor(project,lesson);checkpoint(project,state);
        replaceCode(project,state,step.code,key(state));run();
      });fresh.id='lesson-example';codeMenu.items.append(fresh);
    }
    codeMenu.items.append(button('Original quiz',()=>{
      const project=getProject(),state=stateFor(project,lesson);checkpoint(project,state);
      state.path=null;state.index=0;replaceCode(project,state,lesson.original,'original');run();
    }));
    if(state.undoCode!==null)codeMenu.items.append(button('Undo code change',()=>{
      const project=getProject(),state=stateFor(project,lesson),code=state.undoCode;
      state.undoCode=null;writeCode(code);saveAndRender();
    }));
    tools.append(codeMenu.details);
    if(state.checkpoint){const back=button('← Back to my code',backToCode,'back-to-code');back.id='back-to-code';tools.append(back)}
    root.append(tools);
    if(path){
      const step=path.steps[state.index];
      const strip=document.createElement('section');strip.className='lesson-strip';strip.setAttribute('aria-label','Current lesson step');
      const top=document.createElement('div');top.className='lesson-step-top';
      const heading=text('h3',step.title);heading.tabIndex=-1;
      top.append(heading,text('span',`${path.label} · ${state.index+1}/${path.steps.length}`,'lesson-progress'));
      strip.append(top,text('p',step.instruction));
      const nav=document.createElement('div');nav.className='lesson-navigation';
      const move=delta=>{const project=getProject(),state=stateFor(project,lesson);state.index+=delta;replaceCode(project,state,state.drafts[key(state)]??path.steps[state.index].code,key(state));root.querySelector('.lesson-strip h3').focus({preventScroll:true})};
      const previous=button('← Previous',()=>move(-1));previous.id='lesson-back';previous.disabled=state.index===0;
      const next=button(state.index===path.steps.length-1?'Done':'Next →',()=>state.index===path.steps.length-1?backToCode():move(1));next.id='lesson-next';
      const hint=document.createElement('details');hint.className='lesson-hint';hint.append(text('summary','Hint'));
      hint.append(text('pre',step.focus,'lesson-snippet'),text('p',step.question));
      const locate=button('Find key line',()=>{
        const source=getProject().code,offset=source.indexOf(step.focus);
        if(offset>=0)window.goToCodeLine(source.slice(0,offset).split('\n').length);
      });locate.id='lesson-find';hint.append(locate);
      nav.append(previous,next,hint);strip.append(nav);root.append(strip);
    }
    refreshLocate(project);
  }
  function refreshLocate(project){
    const lesson=lessonFor(project),state=project.lesson;
    const step=lesson?.paths.find(p=>p.id===state?.path)?.steps[state?.index];
    const b=document.getElementById('lesson-find');
    if(b)b.disabled=!step||!project.code.includes(step.focus);
    const fresh=document.getElementById('lesson-example');
    if(fresh)fresh.hidden=!step||!state?.drafts[key(state)]||state.drafts[key(state)]===step.code;
  }
  // Validate lesson state before importing or restoring. Code backups are project data too.
  function validate(project){
    if(!project||project.lesson==null)return;
    const lesson=lessonFor(project),s=project.lesson;
    const code=v=>typeof v==='string'&&v.length<=500000;
    const validKey=k=>k==='original'||lesson?.paths.some(p=>p.steps.some((_,i)=>k===p.id+':'+i));
    const path=lesson?.paths.find(p=>p.id===s.path);
    if(!lesson||!s||s.version!==1||s.id!==lesson.id||
      !(s.buildRevision===undefined||s.buildRevision===2)||
      !Number.isInteger(s.index)||!(s.path===null?s.index===0:(path&&s.index>=0&&s.index<path.steps.length))||
      !(s.loadedStep===null||validKey(s.loadedStep))||
      !s.drafts||typeof s.drafts!=='object'||Array.isArray(s.drafts)||
      Object.entries(s.drafts).some(([k,v])=>!validKey(k)||!code(v))||
      !(s.checkpoint===null||(s.checkpoint&&code(s.checkpoint.code)&&typeof s.checkpoint.title==='string'&&s.checkpoint.title.length<=80))||
      !(s.undoCode===null||code(s.undoCode)))throw Error('This project has unsupported or invalid lesson progress. Your current work has been kept.');
    migrateBuildSteps(s);
  }
  return {render,capture,refreshLocate,validate};
};
