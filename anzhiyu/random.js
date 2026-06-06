var posts=["202602081855693957/","2025060550308/","2026060539720/","202602231529496837/","2026053027139/","202006056856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };