/* Reusable lesson navigation. Reading steps never silently replaces student code. */
window.createLessonController = function({catalog,getProject,writeCode,onChange,run}) {
  const root=document.getElementById('lesson-panel');
  function lessonFor(project){return project.language==='python'?catalog[project.template]:null}
  function stateFor(project,lesson){
    if(!project.lesson)project.lesson={version:1,id:lesson.id,path:null,index:0,loadedStep:null,drafts:{},checkpoint:null,undoCode:null};
    return project.lesson;
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
    state.undoCode=project.code;state.loadedStep=loadedStep;
    writeCode(code);saveAndRender();
  }
  function capture(project){
    const lesson=lessonFor(project),state=project.lesson;
    if(lesson&&state?.loadedStep)state.drafts[state.loadedStep]=project.code;
  }
  function render(){
    const project=getProject(),lesson=lessonFor(project);
    root.hidden=!lesson;
    document.getElementById('challenge-eyebrow').textContent=lesson?'PYTHON · LEARN BY MAKING':'TRY A SMALL CHANGE';
    document.getElementById('challenge-text').hidden=!!lesson;
    if(!lesson){root.replaceChildren();return}
    const state=stateFor(project,lesson);
    root.replaceChildren();
    root.append(text('p',lesson.introduction,'lesson-intro'));
    const routes=document.createElement('div');routes.className='lesson-routes';
    const skills=document.createElement('div');skills.className='lesson-skills';
    for(const path of lesson.paths){
      const b=button(path.label,()=>{
        const project=getProject(),state=stateFor(project,lesson);
        checkpoint(project,state);state.path=path.id;state.index=0;state.loadedStep=null;
        saveAndRender();
      },state.path===path.id?'selected':'');
      b.setAttribute('aria-pressed',String(state.path===path.id));
      b.dataset.path=path.id;
      (path.kind==='route'?routes:skills).append(b);
    }
    root.append(routes,text('p','Explore a key skill','lesson-label'),skills);
    const path=lesson.paths.find(p=>p.id===state.path);
    if(path){
      const step=path.steps[state.index];
      const card=document.createElement('section');card.className='lesson-step';
      card.setAttribute('aria-label','Current lesson step');
      card.append(text('p',`${path.label} · Step ${state.index+1} of ${path.steps.length}`,'lesson-progress'));
      const heading=text('h3',step.title);heading.tabIndex=-1;card.append(heading);
      card.append(text('p',step.instruction));
      const snippet=text('pre',step.focus,'lesson-snippet');card.append(snippet);
      card.append(text('p',step.question,'lesson-question'));
      const actions=document.createElement('div');actions.className='lesson-step-actions';
      const open=button(state.loadedStep===key(state)?'Run my step code':state.drafts[key(state)]?'Resume & run step':'Load & run step',()=>{
        const project=getProject(),state=stateFor(project,lesson);
        checkpoint(project,state);
        const code=state.drafts[key(state)]??step.code;
        replaceCode(project,state,code,key(state));run();
      },'primary');open.id='lesson-load';actions.append(open);
      const locate=button('Find in my code',()=>{
        const source=getProject().code;
        const offset=source.indexOf(step.focus);
        if(offset>=0)window.goToCodeLine(source.slice(0,offset).split('\n').length);
      });locate.id='lesson-find';actions.append(locate);
      const fresh=button('Use step example',()=>{
        const project=getProject(),state=stateFor(project,lesson);
        checkpoint(project,state);replaceCode(project,state,step.code,key(state));run();
      });fresh.id='lesson-example';actions.append(fresh);
      card.append(actions,text('p','Loading a step keeps your starting code. Reading steps does not change the editor.','lesson-note'));
      const nav=document.createElement('div');nav.className='lesson-navigation';
      const move=delta=>{
        const project=getProject(),state=stateFor(project,lesson);state.index+=delta;
        // Keep tracking edits to the last loaded step until another is explicitly loaded.
        saveAndRender();root.querySelector('.lesson-step h3').focus({preventScroll:true});
      };
      const back=button('← Previous',()=>move(-1));back.id='lesson-back';back.disabled=state.index===0;
      const next=button('Next step →',()=>move(1));next.id='lesson-next';next.disabled=state.index===path.steps.length-1;
      nav.append(back,next);card.append(nav);
      if(state.index===path.steps.length-1)card.append(text('p','Path finished? Keep experimenting, choose another skill, or return to the original quiz.','lesson-note'));
      root.append(card);
    }
    const returns=document.createElement('div');returns.className='lesson-returns';
    returns.append(button('Original quiz',()=>{
      const project=getProject(),state=stateFor(project,lesson);checkpoint(project,state);
      state.path=null;state.index=0;replaceCode(project,state,lesson.original);run();
    }));
    if(state.checkpoint)returns.append(button('Return to my starting code',()=>{
      const project=getProject(),state=stateFor(project,lesson),saved=state.checkpoint;
      state.path=null;state.index=0;state.checkpoint=null;
      document.getElementById('title').value=saved.title;
      replaceCode(project,state,saved.code);
    }));
    if(state.undoCode!==null)returns.append(button('Undo code change',()=>{
      const project=getProject(),state=stateFor(project,lesson),code=state.undoCode;
      state.undoCode=null;writeCode(code);saveAndRender();
    }));
    root.append(returns);
    if(state.checkpoint)root.append(text('p','Your starting code and step drafts are included in Save project and browser recovery.','lesson-note'));
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
    const validKey=k=>lesson?.paths.some(p=>p.steps.some((_,i)=>k===p.id+':'+i));
    const path=lesson?.paths.find(p=>p.id===s.path);
    if(!lesson||!s||s.version!==1||s.id!==lesson.id||
      !Number.isInteger(s.index)||!(s.path===null?s.index===0:(path&&s.index>=0&&s.index<path.steps.length))||
      !(s.loadedStep===null||validKey(s.loadedStep))||
      !s.drafts||typeof s.drafts!=='object'||Array.isArray(s.drafts)||
      Object.entries(s.drafts).some(([k,v])=>!validKey(k)||!code(v))||
      !(s.checkpoint===null||(s.checkpoint&&code(s.checkpoint.code)&&typeof s.checkpoint.title==='string'&&s.checkpoint.title.length<=80))||
      !(s.undoCode===null||code(s.undoCode)))throw Error('This project has unsupported or invalid lesson progress. Your current work has been kept.');
  }
  return {render,capture,refreshLocate,validate};
};
