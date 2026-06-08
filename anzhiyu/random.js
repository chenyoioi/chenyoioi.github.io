var posts=["2025050550308/","202602081855693957/","2026060539720/","202507161529496837/","2026053027139/","202001016856/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };