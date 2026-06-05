var posts=["2025060550308/","202602081855693957/","202602231529496837/","2026060539720/","202006056856/","2026053027139/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };