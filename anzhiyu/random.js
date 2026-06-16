var posts=["2025050550308/","202602081855693957/","202507161529496837/","202001016856/","2026060539720/","2026053027139/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };