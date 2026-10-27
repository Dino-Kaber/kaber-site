/* Kaber AI support widget — inline, self-contained.
   Usage: <script src="assets/js/kaber-ai.js" defer></script> before </body> */
(function () {
  var WORKER = 'https://kaber-support.dinosong-trade-512.workers.dev/chat'; /* Cloudflare Worker proxy */
  var FAQ = [
    {q:'What seatpost diameters do you offer?', a:'25.4, 27.2, 28.6, 31.8 and 33.9 mm, in 300–500 mm lengths — iron and aluminum alloy, straight or flippable. Need a different size? We can customize per your request.',
      f:[{q:'Can I get a custom diameter?', a:'Yes. All sizes and lengths are adjustable to your requirements — just tell us the exact spec and quantity.'}]},
    {q:'Straight or flippable?', a:'Both. The flippable type lets you reverse the elastic direction for your preferred ride feel; the straight type is the fixed standard build.',
      f:[{q:'Is 28.6 mm available flippable?', a:'Yes. Flippable is available across sizes, not only 28.6 mm — any diameter and length can be made flippable on request.'}]},
    {q:'What is the maximum rider weight?', a:'The max load is 100 kg, load-tested on every batch before shipping.'},
    {q:'What is your MOQ?', a:'Flexible. We start with samples, then scale with your order. Bulk packing for large orders, individual cartons for small ones.',
      f:[{q:'How do samples work?', a:'Send your spec (diameter, length, type, quantity). We confirm price and shipping, and send samples first — the sample fee is credited on your first order.'}]},
    {q:'How do you control quality?', a:'Every unit is caliper-measured and individually weighed, and batch load-tested to 100 kg. Photos of each measurement are available before shipping.',
      f:[{q:'Can I get QC photos?', a:'Yes. We send caliper, weight and packaging photos for your order before shipment.'}]},
    {q:'How do I get a quote?', a:'Send your diameter, length, type and quantity — via the contact form or WhatsApp. We reply within 48 hours (2 business days).',
      f:[{q:'I want to chat on WhatsApp', a:'Tap the WhatsApp button below to chat with us directly: +86 13325767451 / +853 63298596.'}]}
  ];
  var MAX_TURNS = 20, turns = 0;
  try { turns = parseInt(sessionStorage.getItem('kai_turns') || '0', 10); } catch (e) {}
  function save(){ try { sessionStorage.setItem('kai_turns', String(turns)); } catch (e) {} }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var CSS = '#kaber-ai{font-family:"Archivo",system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}#kaber-ai *{box-sizing:border-box;margin:0}.kai-wrap{position:fixed;right:22px;bottom:22px;z-index:9999}.kai-fab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:76px;height:76px;border-radius:50%;background:#c05621;color:#fff;border:none;padding:0;font-size:10.5px;font-weight:800;line-height:1.15;cursor:pointer;box-shadow:0 8px 24px rgba(25,28,33,.22);font-family:inherit;transition:transform .15s}.kai-fab:hover{transform:translateY(-2px)}.kai-fab .kai-f1{font-size:12.5px;letter-spacing:.3px}.kai-fab .kai-f2{font-size:9.5px;opacity:.92;letter-spacing:.2px}.kai-panel{position:fixed;right:22px;bottom:86px;width:352px;max-width:calc(100vw - 30px);background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(25,28,33,.2);display:none;overflow:hidden;border:1px solid #e4e1da}.kai-panel.open{display:flex;flex-direction:column}.kai-head{background:#191c21;color:#f2f1ed;padding:14px 16px;display:flex;align-items:center;gap:10px}.kai-ava{width:34px;height:34px;border-radius:50%;background:#c05621;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;flex:none}.kai-head h4{font-size:14.5px;font-weight:800}.kai-head p{font-size:12px;color:#a8a49b;margin-top:2px}.kai-body{min-height:320px;max-height:420px;overflow-y:auto;padding:16px 18px;background:#f8f7f4}.kai-msg{display:flex;gap:8px;margin-bottom:12px}.kai-msg .bub{background:#fff;border:1px solid #e4e1da;border-radius:12px 12px 12px 4px;padding:10px 14px;font-size:13.5px;line-height:1.55;color:#1c1f24;max-width:93%}.kai-msg.user{flex-direction:row-reverse}.kai-msg.user .bub{background:#c05621;color:#fff;border:none;border-radius:12px 12px 4px 12px}.kai-faq{display:flex;flex-direction:column;gap:8px;margin-top:4px}.kai-faq button{text-align:left;background:#fff;border:1px solid #d8d4cb;border-radius:10px;padding:10px 12px;font-size:13px;color:#1c1f24;cursor:pointer;font-family:inherit;line-height:1.4}.kai-faq button:hover{border-color:#c05621;color:#c05621}.kai-follow{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.kai-follow button{background:#f0ede6;border:none;border-radius:999px;padding:7px 12px;font-size:12.5px;color:#1c1f24;cursor:pointer;font-family:inherit;font-weight:600}.kai-follow button:hover{background:#c05621;color:#fff}.kai-input{display:flex;gap:8px;padding:11px;border-top:1px solid #e4e1da;background:#fff}.kai-input input{flex:1;border:1px solid #d8d4cb;border-radius:999px;padding:9px 14px;font-size:13px;outline:none;font-family:inherit;background:#f8f7f4}.kai-input input:focus{border-color:#c05621}.kai-input button{background:#c05621;color:#fff;border:none;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}.kai-input button:disabled{opacity:.5;cursor:default}.kai-limit{font-size:11.5px;color:#a8a49b;text-align:center;padding:7px 12px;border-top:1px solid #eee;background:#fff}.kai-foot{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #e4e1da;background:#fff}.kai-foot a{flex:1;text-align:center;background:#f0ede6;color:#1c1f24;border-radius:999px;padding:9px 10px;font-size:12.5px;font-weight:700;text-decoration:none;font-family:inherit}.kai-foot a:hover{background:#e3dfd6}@media(max-width:620px){.kai-panel{width:calc(100vw - 30px);right:15px;bottom:80px}.kai-fab{right:15px;bottom:15px}}';

  var body;
  function msg(text, who){ if(!body) return; var d=document.createElement('div'); d.className='kai-msg '+(who||'bot'); d.innerHTML='<div class="bub">'+esc(text)+'</div>'; body.appendChild(d); body.scrollTop=body.scrollHeight; }
  function qButtons(list){
    var wrap=document.createElement('div'); wrap.className='kai-faq';
    list.forEach(function(item){
      var b=document.createElement('button'); b.textContent=item.q;
      b.onclick=function(){ if(++turns>MAX_TURNS){limit();return;} msg(item.q,'user'); msg(item.a); if(item.f){fb(item.f);} save(); };
      wrap.appendChild(b);
    });
    return wrap;
  }
  function fb(list){
    var wrap=document.createElement('div'); wrap.className='kai-follow';
    list.forEach(function(item){
      var b=document.createElement('button'); b.textContent=item.q;
      b.onclick=function(){ if(++turns>MAX_TURNS){limit();return;} msg(item.q,'user'); msg(item.a); save(); };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
  }
  function limit(){ msg('You have reached the chat limit for this visit. Please email dinosong.trade@ka-ber.com or WhatsApp us — we reply within 48 hours.'); }
  function ask(q){
    if(++turns>MAX_TURNS){limit();save();return;}
    msg(q,'user');
    msg('One moment — checking the details for you…');
    var inp=document.querySelector('.kai-input input'), btn=document.querySelector('.kai-input button');
    if(inp) inp.disabled=true; if(btn) btn.disabled=true;
    fetch(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,lang:'en',session:('k'+(Date.now()%1e6))})})
      .then(function(r){ return r.json().catch(function(){return {};}); })
      .then(function(d){ msg(d.answer || 'Could you share your diameter, length, type and quantity? I will connect you with a quick answer — or email dinosong.trade@ka-ber.com.'); })
      .catch(function(){ msg('Sorry — the instant reply is temporarily offline. Please email dinosong.trade@ka-ber.com or WhatsApp us, we reply within 48 hours.'); })
      .then(function(){ if(inp){inp.disabled=false;} if(btn){btn.disabled=false;} save(); });
  }
  function open(){
    var p=document.querySelector('.kai-panel');
    p.classList.toggle('open');
    var on=p.classList.contains('open');
    if(on){
      var qp=document.getElementById('qrPanel'); if(qp) qp.classList.remove('open');
      var qf=document.getElementById('qrFab'); if(qf) qf.style.visibility='hidden';
      if(!p.querySelector('.kai-faq')){
        msg('Hi! Questions about our suspension seatposts? Pick a topic or type your own.');
        body.appendChild(qButtons(FAQ));
      }
    } else {
      var qf2=document.getElementById('qrFab'); if(qf2) qf2.style.visibility='';
    }
  }
  function init(){
    if(document.getElementById('kaber-ai')) return;
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    var root=document.createElement('div'); root.id='kaber-ai';
    root.innerHTML='<div class="kai-wrap"><button class="kai-fab" id="kai-fab"><span class="kai-f1">FAQ</span><span class="kai-f2">AI Service</span></button></div>'
      +'<div class="kai-panel"><div class="kai-head"><div class="kai-ava">K</div><div><h4>Kaber Support</h4><p>Usually replies within a few minutes</p></div></div>'
      +'<div class="kai-body"></div>'
      +'<div class="kai-input"><input type="text" placeholder="Type your question…" autocomplete="off"><button>Send</button></div>'
      +'<div class="kai-limit">Free chat · limited to '+MAX_TURNS+' replies per visit</div>'
      +'<div class="kai-foot"><a href="https://wa.me/8613325767451?text=Hi%20Kaber%2C%20I%20have%20a%20question%20about%20suspension%20seatposts" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:dinosong.trade@ka-ber.com">Email</a></div></div>';
    document.body.appendChild(root);
    body=document.querySelector('.kai-body');
    document.getElementById('kai-fab').onclick=open;
    var inp=document.querySelector('.kai-input input'), btn=document.querySelector('.kai-input button');
    function go(){ var v=(inp.value||'').trim(); if(v){ inp.value=''; ask(v); } }
    btn.onclick=go;
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ go(); } });
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();
