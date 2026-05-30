var posts=["2026/02/08/旅游随记/","2026/02/23/摸鱼/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };