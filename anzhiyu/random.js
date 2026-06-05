var posts=["2026060550308/","202602231529496837/","202602081855693957/","202605306856/","2026053027139/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };