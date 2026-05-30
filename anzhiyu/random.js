var posts=["202602231529496837/","2026053027139/","202602081855693957/","202605306856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };