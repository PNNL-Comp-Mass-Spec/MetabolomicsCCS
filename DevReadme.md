This is a list of things about the program that aren't obvious.

- The pathway view uses adbio rest api which might be out of date. The reason for this is at the time kegg doesn't have support for [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
which doesn't allow for a website to use an ajax call to another website that doesn't have the same domain. To fix this the website would
require a new backend server, maybe nodejs that would provide the necessary api to relay kegg's api.
