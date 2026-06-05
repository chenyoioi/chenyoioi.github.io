var posts=["2026060550308/","202602231529496837/","202602081855693957/","2026053027139/","202605306856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };