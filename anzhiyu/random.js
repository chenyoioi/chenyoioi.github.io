var posts=["posts/平生无策/","posts/Agnes免费Api使用手册/","posts/旅游随记/","posts/摸鱼/","posts/某教育平台视频下载完整指南/","posts/标签用法手册/","posts/系统激活工具/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };