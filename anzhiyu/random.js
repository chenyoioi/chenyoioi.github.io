var posts=["2025050550308/","202507161529496837/","202602081855693957/","202001016856/","2026053027139/","2026060539720/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };