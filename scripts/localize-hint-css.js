'use strict';

// ponytail: hexo-reference hardcodes a jsDelivr URL for hint.css (blocked in China,
// DNS pollution jsdelivr/jsdelivr#18397). Replace with the self-hosted copy in /lib.
hexo.extend.filter.register('after_post_render', function(data) {
  if (data.content) {
    data.content = data.content.replace(
      'https://cdn.jsdelivr.net/hint.css/2.4.1/hint.min.css',
      '/lib/hint.min.css'
    );
  }
  return data;
}, 20);
