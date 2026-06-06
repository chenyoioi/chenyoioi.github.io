var posts=["2025060550308/","202602231529496837/","202602081855693957/","2026053027139/","2026060539720/","202006056856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };