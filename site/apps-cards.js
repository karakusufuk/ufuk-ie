/* App cards: on hover the real screens of the app play (top half of the screen only); on mouse-out the card returns to its resting screen. */
(function(){
  var PUSH='cubic-bezier(.32,.72,0,1)', SCROLL='cubic-bezier(.45,0,.2,1)';
  var cards=[].slice.call(document.querySelectorAll('.card .ac')); if(!cards.length) return;
  var calm=false; try{calm=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  function q(ac,s){ return ac.querySelector(s); }
  function fit(ac){ var s=q(ac,'.acs'); if(s&&s.clientWidth) ac.style.setProperty('--k',s.clientWidth/402); }

  /* each story: given the card, schedule its animations (anim(el,frames,delay,duration,easing)) and timers (at(ms,fn)) */
  var story={
    kus:function(ac,anim,at){
      var home=q(ac,'.k-home'), prof=q(ac,'.k-prof'), cover=q(ac,'.k-cover'), strip=q(ac,'.kstrip'), t9=q(ac,'.s9t'), b9=q(ac,'.s9b');
      anim(home,[{transform:'translateX(100%)'},{transform:'translateX(0)'}],300,600,PUSH);                    /* cover -> home */
      anim(cover,[{transform:'translateX(0)'},{transform:'translateX(-28%)'}],300,600,PUSH);
      anim(prof,[{transform:'translateX(100%)'},{transform:'translateX(0)'}],1900,600,PUSH);                   /* home -> profile */
      anim(home,[{transform:'translateX(0)'},{transform:'translateX(-28%)'}],1900,600,PUSH);
      anim(strip,[{transform:'translateY(0)'},{transform:'translateY(-726px)'}],3000,650,SCROLL);              /* the profile scrolls up */
      anim(strip,[{transform:'translateY(-726px)'},{transform:'translateY(-1175px)'}],4300,500,SCROLL);        /* to the day's shift */
      anim(t9,[{opacity:1},{opacity:0}],5000,200);                                                              /* the day opens: blocks and breaks */
      anim(b9,[{transform:'translateY(0)'},{transform:'translateY(224px)'}],5000,450,'cubic-bezier(.3,.7,.2,1)');
      anim(strip,[{transform:'translateY(-1175px)'},{transform:'translateY(-1320px)'}],5600,450,SCROLL);      /* shift and break times fill the half screen */
    },
    master:function(ac,anim){
      var fb=q(ac,'.m-fb'), qz=q(ac,'.m-q'), cover=q(ac,'.m-cover');
      anim(fb,[{transform:'translateX(100%)'},{transform:'translateX(0)'}],300,600,PUSH);                      /* cover -> Premier League */
      anim(cover,[{transform:'translateX(0)'},{transform:'translateX(-28%)'}],300,600,PUSH);
      anim(qz,[{transform:'translateX(100%)'},{transform:'translateX(0)'}],2300,600,PUSH);                     /* -> the question starts: Get ready */
      anim(fb,[{transform:'translateX(0)'},{transform:'translateX(-28%)'}],2300,600,PUSH);
    },
    match:function(ac,anim,at){
      var v=q(ac,'video');
      try{v.currentTime=0;}catch(e){} var p=v.play(); if(p&&p.catch)p.catch(function(){});                     /* PLAY is tapped: the night screen turns into the snowy one */
      at(4300,function(){ v.pause(); });
    },
    pass:function(ac,anim,at){
      var v=q(ac,'video'), smoke=q(ac,'.acfade');
      try{v.currentTime=0;}catch(e){} var p=v.play(); if(p&&p.catch)p.catch(function(){});                     /* the dial sweeps in */
      anim(smoke,[{opacity:0},{opacity:1}],4300,900,'ease');                                                    /* then a soft fade to the smoky screen */
      at(4900,function(){ v.pause(); });
    }
  };

  cards.forEach(function(ac){
    var kind=ac.getAttribute('data-ac'), card=ac.closest('.card'), rest=q(ac,'.acr'), vid=q(ac,'video');
    var runs=[], timers=[], resetT=0;
    function anim(el,frames,delay,dur,ease){ runs.push(el.animate(frames,{delay:delay,duration:dur,easing:ease||'linear',fill:'forwards'})); }
    function at(ms,fn){ timers.push(setTimeout(fn,ms)); }
    function clear(){ runs.forEach(function(a){a.cancel();}); runs=[]; timers.forEach(clearTimeout); timers=[]; if(vid){ vid.pause(); try{vid.currentTime=0;}catch(e){} } }
    function start(){
      clearTimeout(resetT); rest.style.transition='none'; rest.classList.remove('on'); clear();
      story[kind](ac,anim,at);
    }
    function leave(){
      timers.forEach(clearTimeout); timers=[];
      rest.style.transition=''; rest.classList.add('on');                                                       /* the resting screen fades back over whatever is showing */
      clearTimeout(resetT); resetT=setTimeout(function(){ clear(); rest.style.transition='none'; rest.classList.remove('on'); },300);
    }
    if(calm) return;
    card.addEventListener('mouseenter',start); card.addEventListener('mouseleave',leave);
    card.addEventListener('focusin',function(){ if(card.matches(':focus-visible')) start(); }); card.addEventListener('focusout',leave);
  });

  function fitAll(){ cards.forEach(fit); }
  if('ResizeObserver' in window){ var ro=new ResizeObserver(fitAll); cards.forEach(function(ac){ ro.observe(ac); }); }
  window.addEventListener('resize',fitAll); window.addEventListener('load',fitAll); fitAll();
  /* the screens' videos are fetched before the pointer arrives */
  var vids=[].slice.call(document.querySelectorAll('.ac video'));
  function warm(v){ if(v._w) return; v._w=1; v.preload='auto'; try{v.load();}catch(e){} }
  if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){warm(e.target);io.unobserve(e.target);}});},{rootMargin:'900px 0px'}); vids.forEach(function(v){io.observe(v);}); }
  else vids.forEach(warm);
})();
