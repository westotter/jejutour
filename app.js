const $ = id => document.getElementById(id);
const places = [
 {id:'mok',name:'제주목 관아',type:'역사 유적',address:'제주시 관덕로 25',description:'옛 제주의 행정과 문화가 머물던 곳. 전통 건축 사이로 제주의 시간을 걸어요.',x:24,y:30,source:'https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_300000000013301'},
 {id:'gwan',name:'관덕정',type:'역사 유적',address:'제주시 관덕로 19',description:'원도심의 오랜 만남의 장소. 누각과 광장에서 제주의 역사에 한 발 다가가요.',x:30,y:49,source:'https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1123903220000&pageNo=1_1_1_1'},
 {id:'ia',name:'예술공간 이아',type:'문화 예술',address:'제주시 중앙로14길 21',description:'옛 병원 건물에 새롭게 깃든 예술. 원도심에서 전시와 창작의 이야기를 만나요.',x:43,y:67,source:'https://www.visitjeju.net/cn/festival/view?contentsid=CNTS_300000000014498&menuId=DOM_700000000010798'},
 {id:'sanji',name:'산지천갤러리',type:'문화 예술',address:'제주시 중앙로3길 36',description:'오래된 여관에서 문화 공간으로. 산지천 곁에서 지역의 예술을 발견해보세요.',x:73,y:36,source:'https://www.visitjeju.net/kr/festival/view?contentsid=CNTS_300000000014585'},
 {id:'ohyeon',name:'오현단',type:'역사 유적',address:'제주시 오현길 61',description:'제주의 다섯 현인을 기리는 공간. 오래된 성곽과 고요한 풍경 속에 잠시 머물러요.',x:67,y:80,source:'https://www.visitjeju.net/kr/festival/view?contentsid=CNTS_300000000014528&menuId=DOM_000001718007000000'}
];
const storageKey = 'jeju-one-step-v1';
let filter = '전체', chosen = '', tasks = [], highlightSelection = null;
function validTasks(value) { return Array.isArray(value) ? value.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string').map(t => ({...t, text:t.text.slice(0,200), highlights: Array.isArray(t.highlights) ? t.highlights.filter(r => Array.isArray(r) && Number.isInteger(r[0]) && Number.isInteger(r[1]) && r[0]>=0 && r[1]>r[0] && r[1]<=t.text.length).sort((a,b)=>a[0]-b[0]) : []})) : []; }
try { const stored = localStorage.getItem(storageKey); tasks = stored ? validTasks(JSON.parse(stored)) : [{id:'welcome-1',text:'관덕정에서 오래된 제주 만나기',placeId:'gwan',done:false,important:false,highlights:[[0,3]]},{id:'welcome-2',text:'산지천갤러리에서 전시 감상하기',placeId:'sanji',done:false,important:false,highlights:[]}]; } catch { tasks=[]; }
function daily(){ return tasks; }
function notify(message){ $('toast').textContent=message; $('toast').classList.add('visible'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>$('toast').classList.remove('visible'),2600); }
function save(){try{localStorage.setItem(storageKey,JSON.stringify(tasks));$('save-status').textContent='이 브라우저에 자동으로 저장돼요.';}catch{$('save-status').textContent='저장 불가 · 새로고침하면 변경 내용이 사라져요.';notify('브라우저 저장 공간을 사용할 수 없어요.');}}
function el(tag, cls, text){const node=document.createElement(tag); if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function addTask(text,placeId){tasks.push({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,text,placeId,done:false,important:false,highlights:[]});save();render();notify('산책 리스트에 담았어요.');}
function renderPlaces(){const query=$('search').value.trim().toLowerCase();const visible=places.filter(p=>(filter==='전체'||p.type===filter)&&`${p.name} ${p.address} ${p.description}`.toLowerCase().includes(query));$('result-count').textContent=visible.length;$('places').replaceChildren();$('markers').replaceChildren();if(!visible.length)$('places').append(el('p','empty-state','검색 결과가 없어요. 다른 장소나 주소를 입력해보세요.'));
for(const p of visible){const number=places.indexOf(p)+1;const art=p.type==='문화 예술';const marker=el('button',`marker${art?' art':''}${chosen===p.id?' chosen':''}`);marker.style.left=`${p.x}%`;marker.style.top=`${p.y}%`;marker.setAttribute('aria-label',`${p.name} 정보 보기`);marker.setAttribute('aria-pressed',String(chosen===p.id));marker.append(el('b','',number),el('span','',p.name));marker.onclick=()=>{chosen=p.id;renderPlaces();document.getElementById(`place-${p.id}`).scrollIntoView({block:'nearest',behavior:'smooth'});};$('markers').append(marker);
const card=el('article',`place${chosen===p.id?' chosen':''}`);card.id=`place-${p.id}`;const top=el('div','place-top');top.append(el('span',`badge${art?' art':''}`,p.type),el('span','place-number',String(number).padStart(2,'0')));card.append(top,el('h3','',p.name),el('p','',p.description),el('div','address',`⌖ ${p.address}`));const actions=el('div','card-actions');const link=el('a','','지도 보기 ↗');link.href=`https://map.kakao.com/link/search/${encodeURIComponent(p.name+' '+p.address)}`;link.target='_blank';link.rel='noopener noreferrer';const button=el('button','',tasks.some(t=>t.placeId===p.id)?'✓ 담은 장소':'+ 산책에 담기');button.disabled=tasks.some(t=>t.placeId===p.id);button.onclick=()=>addTask(`${p.name} 방문하기`,p.id);actions.append(link,button);card.append(actions);$('places').append(card);}}
function renderText(element,task){let cursor=0;const ranges=task.important?[[0,task.text.length]]:task.highlights||[];for(const [start,end]of ranges){if(end<=cursor)continue;element.append(document.createTextNode(task.text.slice(cursor,Math.max(cursor,start))));const mark=el('mark','',task.text.slice(Math.max(cursor,start),end));element.append(mark);cursor=end;}element.append(document.createTextNode(task.text.slice(cursor)));}
function renderTodos(){const done=tasks.filter(t=>t.done).length;$('nav-count').textContent=tasks.length;$('progress-count').textContent=`${done} / ${tasks.length} 완료`;$('progress-fill').style.width=`${tasks.length?done/tasks.length*100:0}%`;$('todo-list').replaceChildren();if(!tasks.length)$('todo-list').append(el('div','empty-state','아직 비어 있는 산책 리스트\n첫 번째 장소를 담아보세요.'));
for(const task of tasks){const row=el('div',`todo-item${task.done?' completed':''}`);const check=el('input','todo-check');check.type='checkbox';check.checked=!!task.done;check.setAttribute('aria-label',`${task.text} 완료`);check.onchange=()=>{task.done=check.checked;hideHighlight();save();render();};const text=el('span','todo-text');text.dataset.taskId=task.id;renderText(text,task);const actions=el('div','todo-actions');const star=el('button',`star${task.important?' active':''}`,task.important?'★':'☆');star.setAttribute('aria-label',`${task.text} 중요 표시 ${task.important?'해제':'설정'}`);star.setAttribute('aria-pressed',String(!!task.important));star.onclick=()=>{task.important=!task.important;hideHighlight();save();render();};const remove=el('button','delete','×');remove.setAttribute('aria-label',`${task.text} 삭제`);remove.onclick=()=>{tasks=tasks.filter(t=>t.id!==task.id);hideHighlight();save();render();notify('산책 리스트에서 삭제했어요.');};actions.append(star,remove);row.append(check,text,actions);$('todo-list').append(row);}}
function render(){renderPlaces();renderTodos();}
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderPlaces();});
$('search').addEventListener('input',renderPlaces);
$('add-form').onsubmit=event=>{event.preventDefault();const text=$('new-todo').value.trim();if(!text)return;hideHighlight();addTask(text);$('new-todo').value='';$('new-todo').focus();};
function hideHighlight() { $('highlight-toolbar').hidden = true; highlightSelection = null; }
document.addEventListener('pointerup', event => {
  if (event.target.closest('#highlight-toolbar')) return;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) { hideHighlight(); return; }
  const range = selection.getRangeAt(0);
  const parentOf = node => (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest('.todo-text');
  const textElement = parentOf(range.startContainer);
  if (!textElement || textElement !== parentOf(range.endContainer)) { hideHighlight(); return; }
  const prefix = document.createRange(); prefix.selectNodeContents(textElement); prefix.setEnd(range.startContainer, range.startOffset);
  const start = prefix.toString().length; const end = start + range.toString().length;
  highlightSelection = { id: textElement.dataset.taskId, start, end };
  const rect = range.getBoundingClientRect(); const toolbar = $('highlight-toolbar'); toolbar.hidden = false;
  toolbar.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - toolbar.offsetWidth - 8))}px`;
  toolbar.style.top = `${Math.max(8, rect.top - toolbar.offsetHeight - 8)}px`;
});
function updateHighlight(clear) {
  if (!highlightSelection) return;
  const { id, start, end } = highlightSelection; const task = daily().find(item => item.id === id); if (!task) return;
  if (clear) { if (task.important) task.highlights = [[0, task.text.length]]; task.important = false; task.highlights = (task.highlights || []).flatMap(([a,b]) => b <= start || a >= end ? [[a,b]] : [...(a < start ? [[a,start]] : []), ...(b > end ? [[end,b]] : [])]); }
  else { const ranges = [...(task.highlights || []), [start,end]].sort((a,b) => a[0]-b[0]); task.highlights = []; for (const range of ranges) { const last = task.highlights.at(-1); if (last && range[0] <= last[1]) last[1] = Math.max(last[1],range[1]); else task.highlights.push([...range]); } }
  save(); window.getSelection()?.removeAllRanges(); hideHighlight(); render();
}
$('apply-highlight').onclick = () => updateHighlight(false);
$('clear-highlight').onclick = () => updateHighlight(true);
window.addEventListener('resize', hideHighlight);
window.addEventListener('scroll', hideHighlight, true);
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideHighlight(); });

window.addEventListener('storage',event=>{if(event.key===storageKey){try{tasks=validTasks(JSON.parse(event.newValue||'[]'));hideHighlight();render();}catch{}}});
render();

