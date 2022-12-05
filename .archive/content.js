var frames = document.getElementsByTagName('iframe');
for (var i in frames) {
    if (frames[i].src && frames[i].src.match(/^https?:\/\/ki\.instructure\.com/)) {
        var el = document.createElement("a");
        el.setAttribute("href", frames[i].src);
        el.setAttribute("target", "__blank");
        el.innerHTML = frames[i].title + "<br/>";
        frames[i].parentNode.insertBefore(el, frames[i]);
    }
}
