var posts=["202507161529496837/","2026060539720/","2025050550308/","202001016856/","2026053027139/","202602081855693957/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };