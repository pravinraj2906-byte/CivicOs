import fixtures from './fixtures.json';

// Public evaluation transport. This never calls Gemini, n8n or a government API.
// Each browser has its own synthetic records. The Python backend remains a separate runnable app.
type Row = Record<string, any>;
const KEY = 'civicos_evaluation_v1';
const copy = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const now = () => new Date().toISOString();
function state(): Row {
  try { const saved = localStorage.getItem(KEY); if (saved) return JSON.parse(saved); } catch { /* reset malformed demo */ }
  const s: Row = copy(fixtures); s.confirmations = {}; save(s); return s;
}
function save(s: Row) { localStorage.setItem(KEY, JSON.stringify(s)); }
function fail(status: number, detail: string): never { throw { message: detail, response: { status, data: { detail } } }; }
function current(s: Row, config: Row): Row {
  const token = String(config.headers?.Authorization || '');
  const id = Number(token.match(/civic-demo-(\d+)/)?.[1]);
  return s.users.find((u: Row) => u.id === id) || fail(401, 'Select a demonstration account first.');
}
function detail(s: Row, id: string): Row {
  return s.grievances.find((g: Row) => String(g.id) === id || g.tracking_id === id) || fail(404, 'Demo complaint not found.');
}
function event(g: Row, status: string, remarks: string, officer?: Row) {
  g.status = status; g.updated_at = now();
  g.updates ||= [];
  g.updates.push({ id: Date.now(), grievance_id: g.id, officer_id: officer?.id || null, officer: officer || null, status, remarks, created_at: now() });
}
function feedItem(s: Row, g: Row, u?: Row): Row {
  const author = s.users.find((x: Row) => x.id === g.citizen_id);
  const confirmed = s.confirmations[g.id] || [];
  return { ...g, grievance_id: g.id, author: { display_name: author?.name || 'Demo resident', district: author?.district, state: author?.state }, is_verified: false, community_count: confirmed.length, confirmed_by_current_user: confirmed.includes(u?.id), timeline: (g.updates || []).map((e: Row) => ({ ...e, stage: e.status === 'SUBMITTED' ? 'CITIZEN_REPORT' : e.status === 'TRIAGED' ? 'AI_TRIAGE' : e.status === 'RESOLVED' ? 'RESOLUTION' : 'OFFICIAL_UPDATE', label: e.status.replaceAll('_', ' ') })) };
}
function matching(s: Row, context: Row): Row[] {
  const words = String(context.query || context.occupation || '').toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
  return s.schemes.filter((sc: Row) => !words.length || words.some((w: string) => `${sc.name} ${sc.category} ${sc.target_groups}`.toLowerCase().includes(w))).slice(0,5).map((sc: Row) => ({ scheme_id: sc.id, scheme_code: sc.code, scheme_name: sc.name, category: sc.category, eligibility_status: 'MORE_INFO_NEEDED', confidence: 0, why_you_qualify: 'Demonstration catalogue suggestion only. Check every current eligibility condition with the official authority.', benefits_summary: sc.benefits, required_documents: sc.required_documents_list || [], application_steps: sc.application_steps, official_portal: sc.official_portal, source_name: sc.source_name, missing_information: ['Current official eligibility verification'] }));
}
export async function demoAdapter(config: Row): Promise<any> {
  const s = state(); const method = String(config.method || 'get').toLowerCase();
  const url = String(config.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/v1/, '');
  const body: Row = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
  const p: Row = config.params || {}; let result: any;
  if (url === '/health') result = { status: 'ok', service: 'CivicOs browser-local evaluation demo' };
  else if (url === '/auth/login') {
    const user = s.users.find((u: Row) => u.email.toLowerCase() === String(body.email).toLowerCase());
    if (!user) fail(401, 'Choose one of the listed synthetic demonstration accounts.');
    result = { access_token: `civic-demo-${user.id}`, token_type: 'bearer', expires_in: 86400, user };
  } else if (url === '/auth/register') fail(400, 'Public demo uses synthetic presets. Select a demo account; please do not enter personal details.');
  else if (url === '/schemes') {
    result = s.schemes.filter((sc: Row) => (!p.category || sc.category === p.category) && (!p.search || `${sc.name} ${sc.description}`.toLowerCase().includes(String(p.search).toLowerCase())));
  } else if (url === '/schemes/eligibility' || url === '/schemes/assistant') {
    const matches = matching(s, body);
    result = { citizen_context_summary: 'Synthetic evaluation profile', matches, explanation: 'Illustrative matching only; no official eligibility decision.', answer: matches.length ? 'These catalogue entries match your topic. Open the official source and check current requirements. No live AI request was made.' : 'No matching catalogue entry. Try a topic such as farmer, solar, housing or student.', suggested_prompts: ['Farmer schemes', 'Solar support', 'Housing assistance'], source: 'BROWSER_DEMO_RULES' };
  } else if (/^\/schemes\/\d+$/.test(url)) result = s.schemes.find((sc: Row) => sc.id === Number(url.split('/').pop())) || fail(404, 'Scheme not found.');
  else {
    const u = current(s, config);
    if (url === '/auth/me') result = u;
    else if (url === '/citizens/me') result = s.profiles[u.id] || { ...u, profile: null };
    else if (url === '/citizens/me/profile' && method === 'put') {
      const profile = { ...(s.profiles[u.id]?.profile || {}), ...body, id: u.id, user_id: u.id, updated_at: now() };
      s.profiles[u.id] = { ...u, profile }; save(s); result = profile;
    } else if (url === '/citizens/me/recommendations') result = { citizen_id: u.id, generated_at: now(), citizen_context_summary: 'Synthetic demo profile', recommendations: matching(s, {}).map((m: Row) => ({ ...m, match_confidence: 0, potential_benefits: 'Illustrative catalogue guidance; official verification required.' })) };
    else if (url === '/citizens/me/grievances') result = s.grievances.filter((g: Row) => g.citizen_id === u.id);
    else if (url === '/grievances' && method === 'post') {
      if (u.role !== 'citizen') fail(403, 'Use a citizen demo account to report an issue.');
      if (!String(body.description || '').trim()) fail(400, 'Describe the demonstration issue.');
      const words = `${body.title} ${body.description} ${body.category}`.toLowerCase();
      const department = /water|drain|sewage|garbage/.test(words) ? 'Water_Sanitation' : /road|pothole|street|light/.test(words) ? 'Public_Works' : 'Municipal_Corp';
      const g: Row = { id: Math.max(0,...s.grievances.map((x: Row) => x.id))+1, tracking_id: `DEMO-${Date.now().toString(36).toUpperCase()}`, citizen_id: u.id, citizen: u, title: body.title || String(body.description).slice(0,65), description: body.description, location: body.location || 'Synthetic demo location', landmark: body.landmark || '', category: body.category || 'General', priority: 'MEDIUM', department, status: 'TRIAGED', urgency_score: null, ai_source: 'BROWSER_DEMO_RULES', ai_summary: 'Illustrative keyword routing. No live AI or government submission.', suggested_initial_action: 'Demonstration officer review required.', key_entities: [], assigned_officer_id: null, assigned_officer: null, created_at: now(), updated_at: now(), updates: [] };
      event(g,'SUBMITTED','Synthetic browser-local report created.'); event(g,'TRIAGED',`Demo keyword routing to ${department}.`); s.grievances.unshift(g);save(s);result=g;
    } else if (/^\/officer\/grievances/.test(url)) {
      if (u.role !== 'officer') fail(403, 'Use an officer demo account.');
      const id = url.split('/')[3];
      if (!id) result = s.grievances.filter((g: Row) => (!p.status || g.status === p.status) && (!p.priority || g.priority === p.priority) && (!p.department || g.department === p.department));
      else { const g = detail(s,id); if (method === 'patch') { if (!['SUBMITTED','TRIAGED','IN_PROGRESS','RESOLVED','REJECTED'].includes(body.status)) fail(400,'Invalid demo status.'); event(g,body.status,body.remarks || 'Demonstration status change.',u);g.assigned_officer=u;g.assigned_officer_id=u.id;save(s); } result = g; }
    } else if (/^\/grievances\/[^/]+$/.test(url)) {
      const g=detail(s,url.split('/')[2]);if (u.role==='citizen' && g.citizen_id!==u.id) fail(403,'This demo complaint belongs to another citizen.');result=g;
    } else if (/^\/citizens\/me\/grievances\/[^/]+\/feedback$/.test(url)) {
      const g=detail(s,url.split('/')[4]);if(g.citizen_id!==u.id)fail(403,'This is another demo citizen’s complaint.'); event(g,body.is_resolved?'RESOLVED':'IN_PROGRESS',body.comment || (body.is_resolved?'Citizen confirmed demo closure.':'Citizen reopened the demonstration issue.'));save(s);result=g;
    } else if (url==='/feed') {
      let items=s.grievances.map((g: Row)=>feedItem(s,g,u));
      for(const k of ['status','category','department','priority'])if(p[k]&&p[k]!=='ALL')items=items.filter((g: Row)=>g[k]===p[k]);
      if(p.search)items=items.filter((g: Row)=>`${g.title} ${g.description} ${g.location}`.toLowerCase().includes(String(p.search).toLowerCase()));
      const page=Number(p.page)||1,limit=Number(p.limit)||20;result={items:items.slice((page-1)*limit,page*limit),total:items.length,page,limit,total_pages:Math.max(1,Math.ceil(items.length/limit)),has_more:page*limit<items.length};
    } else if (/^\/feed\/[^/]+/.test(url)) {
      const g=detail(s,url.split('/')[2]);
      if(url.endsWith('/confirm')) {const ids=new Set<number>(s.confirmations[g.id] || []);if(method==='delete')ids.delete(u.id);else ids.add(u.id);s.confirmations[g.id]=[...ids];save(s);result={grievance_id:g.id,tracking_id:g.tracking_id,community_count:ids.size,confirmed:ids.has(u.id),message:'Browser-local demonstration updated.'};}
      else result=feedItem(s,g,u);
    } else fail(404,'This operation is outside the hosted evaluation demo.');
  }
  return { data: copy(result), status: 200, statusText: 'OK', headers: {}, config };
}
