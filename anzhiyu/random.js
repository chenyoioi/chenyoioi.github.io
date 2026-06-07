var posts=["2025060550308/","2026060539720/","202602081855693957/","2026053027139/","202602231529496837/","202006056856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };