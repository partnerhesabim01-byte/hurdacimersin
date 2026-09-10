(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      links.classList.toggle('open');
    });
  }

  var banner = document.getElementById('cookieBanner');
  if(banner && !document.cookie.includes('hurdacimersin_cookie_consent=')){
    banner.classList.add('show');
  }
  var accept = document.getElementById('cbAccept');
  var reject = document.getElementById('cbReject');
  function closeBanner(val){
    document.cookie = 'hurdacimersin_cookie_consent=' + val + ';max-age=31536000;path=/';
    if(banner) banner.classList.remove('show');
  }
  if(accept) accept.addEventListener('click', function(){ closeBanner('accepted'); });
  if(reject) reject.addEventListener('click', function(){ closeBanner('rejected'); });
})();
