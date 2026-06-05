var posts=["202602231529496837/","2026060550308/","202602081855693957/","202606056856/","2026053027139/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };