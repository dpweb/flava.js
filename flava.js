$ = document.querySelector.bind(document);

load = function(s, cb) {
    cb = cb || function() {};
    var css = s.match(/css$/);
    var i = document.body.appendChild(document.createElement(css ? 'link' : 'script'));
    i.onload = cb;
    if (css)
        css.rel = "stylesheet";
    i[css ? 'href' : 'src'] = s;
}

post = function(u, d, cb) {
    var x = new XMLHttpRequest;
    x.open('POST', u, true);
    x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    x.send(d);
    x.onload = function(r) {
        var resp = r.target.responseText;
        try {
            resp = JSON.parse(resp);
        } catch (e) {}
        (cb || console.log.bind(console))(resp);
    };
}

sse = function(url, cb) {
    var e = new EventSource(url);
    e.onmessage = function(resp) {
        var data = resp.data;
        try{
          data = JSON.parse(data);
        } catch(e){}
        cb(data);
    }
}

render = function(id, o, isNew, cb) {
  load('//cdnjs.cloudflare.com/ajax/libs/hogan.js/3.0.0/hogan.js', function(){
  		var e = isNew ? document.body.appendChild(document.createElement('div')) : $(id);
        e.innerHTML = Hogan.compile($(id).innerHTML).render(o);
        cb && cb(e);
  });
}

// <script x-updates='/feed' x-process='funcname' src='flava.js'></script>
var wsurl = d.querySelector('[x-updates]');
if(wsurl){
  var ev = new EventSource(wsurl.getAttribute('x-updates'));
  var processfunc = wsurl.getAttribute('x-process');
  ev.onmessage = function(e){
    var data = JSON.parse(e.data);
    if(processfunc)
      data = window[processfunc](data);
      render(data);
  }  
}

var es = document.getElementsByTagName('*');
var match = /^X\-(.*)/;
[].slice.call(es).map(function(e) {
    var nn = e.nodeName.match(match),
        p = {};
    if (!nn) return;
    console.debug(e.nodeName);
    [].slice.call(e.attributes).forEach(function(a) {
        p[a.nodeName] = a.value;
    })
    var func = window[nn[1].toLowerCase()];
    if (!func)
        return console.log('flava error: ' + nn[1] + ' is not defined');
    var o = func.call(window, p, e);
    typeof o === 'object' ? window[e.id] = o : e.innerHTML = o;
});

Element.prototype.fadeOut = function(n) {
  var opac = 100;var e= this;
  setInterval(function() {
    e.style.opacity = (opac--/100); if(!opac) document.body.removeChild(e.parentElement)}, n||300)
}
