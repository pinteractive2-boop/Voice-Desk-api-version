// Run: ANTHROPIC_API_KEY=sk-ant-... node ai-server.js   (Node 18+)
// Then in VoiceDesk: Settings > Voice > "Claude via my server", address http://localhost:8787/interpret
const http=require('http');
const KEY=process.env.ANTHROPIC_API_KEY,MODEL=process.env.ANTHROPIC_MODEL||'claude-sonnet-4-5';
http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  if(req.method!=='POST'||req.url!=='/interpret'){res.writeHead(404);return res.end()}
  let b='';for await(const c of req)b+=c;
  try{
    const {prompt}=JSON.parse(b);
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:MODEL,max_tokens:1500,messages:[{role:'user',content:prompt}]})});
    const j=await r.json();if(!r.ok)throw new Error(JSON.stringify(j));
    res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({text:j.content[0].text}));
  }catch(e){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:String(e)}))}
}).listen(8787,()=>console.log('VoiceDesk AI server on http://localhost:8787/interpret'));
