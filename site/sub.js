/* ufuk.ie subpages: the print line.
   About: the line starts at the header, settles at 60% of the screen and prints the page down to the footer.
   Project pages: the line opens under the title block; once you scroll it drops to the bottom of the screen and stops hiding anything.
   On every page the line can never pass the footer's top edge: the footer itself carries the line once they meet. */
(function(){
  try{history.scrollRestoration='manual';}catch(e){}
  function toTop(){ if(!location.hash && !window.ufukBack) window.scrollTo(0,0); }
  toTop(); addEventListener('pageshow',toTop);
  var line=document.querySelector('.laser'), veil=document.querySelector('.veil'), end=document.querySelector('.end'), bar=document.querySelector('.top'), head=document.querySelector('.p-head');
  var reduce=false; try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  if(!line||!veil||!end||!bar||reduce) return;
  var about=document.body.getAttribute('data-line')==='about';
  var t0=0, last=0, down=0;
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function frame(ts){
    if(!t0){t0=ts;last=ts;}
    var dt=Math.min(64,ts-last); last=ts;
    var intro=ease(Math.min(1,(ts-t0)/1400));
    var vh=innerHeight, hb=bar.getBoundingClientRect().bottom, ft=end.getBoundingClientRect().top, want;
    if(about){
      var span=(ft+scrollY)-vh, p=span>0?Math.min(1,Math.max(0,scrollY/span)):1;
      var start=Math.max(hb,vh*0.6);
      want=start+(vh-start)*p;
    }else{
      var tgt=scrollY>4?1:0;
      down=tgt>down?Math.min(1,down+dt/700):Math.max(0,down-dt/700);
      var home=head?head.getBoundingClientRect().bottom-24:vh*0.6;
      home=Math.max(hb,Math.min(home,vh-40));
      want=home+((vh-36)-home)*ease(down);
    }
    var y=hb+(want-hb)*intro, locked=ft<=y+0.5;
    if(locked) y=ft;
    var v='translate3d(0,'+y.toFixed(2)+'px,0)';
    line.style.transform=v; veil.style.transform=v;
    line.style.opacity=locked?'0':'1';
    end.classList.toggle('lock',locked);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(function(){requestAnimationFrame(frame);});
})();
