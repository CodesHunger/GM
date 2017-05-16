// ==UserScript==
// @name						Text To link
// @description					Turn plain text URLs into clickable links, 把文字链接转换为可点击链接
// @author						lkytal
// @namespace					Lkytal
// @homepage					https://lkytal.github.io/
// @include						*
// @exclude						*pan.baidu.com/*
// @exclude						*renren.com/*
// @exclude						*exhentai.org/*
// @exclude						*music.google.com/*
// @exclude						*mail.google.com/*
// @exclude						*docs.google.com/*
// @exclude						*www.google.*
// @exclude						*acid3.acidtests.org/*
// @exclude						*.163.com/*
// @version						2.8.0
// @icon						http://lkytal.qiniudn.com/link.png
// @grant						unsafeWindow
// @homepageURL					https://git.oschina.net/coldfire/GM
// @updateURL					https://git.oschina.net/coldfire/GM/raw/master/meta/linkMix.meta.js
// @downloadURL					https://git.oschina.net/coldfire/GM/raw/master/linkMix.user.js
// ==/UserScript==

"use strict";
var clearLink, excludedTags, linkFilter, linkMixInit, linkPack, linkify, observePage, observer, setLink, url_regexp, xpath;

url_regexp = /((https?:\/\/|www\.)[\x21-\x7e]+[\w\/]|(\w[\w._-]+\.(com|cn|org|net|info|tv|cc|gov|xxx))(\/[\x21-\x7e]*[\w\/])?|ed2k:\/\/[\x21-\x7e]+\|\/|thunder:\/\/[\x21-\x7e]+=)/gi;

clearLink = function(event) {
  var link, ref, url;
  link = (ref = event.originalTarget) != null ? ref : event.target;
  if (!((link != null) && link.localName === "a" && link.className.indexOf("texttolink") !== -1)) {
    return;
  }
  url = link.getAttribute("href");
  if (url.indexOf("http") !== 0 && url.indexOf("ed2k://") !== 0 && url.indexOf("thunder://") !== 0) {
    return link.setAttribute("href", "http://" + url);
  }
};

document.addEventListener("mouseover", clearLink);

setLink = function(candidate) {
  var span, text;
  if ((candidate == null) || candidate.parentNode.className.indexOf("texttolink") !== -1 || candidate.nodeName === "#cdata-section") {
    return;
  }
  text = candidate.textContent.replace(url_regexp, '<a href="$1" target="_blank" class="texttolink">$1</a>');
  if (candidate.textContent.length === text.length) {
    return;
  }
  span = document.createElement("span");
  span.innerHTML = text;
  return candidate.parentNode.replaceChild(span, candidate);
};

excludedTags = "a,svg,canvas,applet,input,button,area,pre,embed,frame,frameset,head,iframe,img,option,map,meta,noscript,object,script,style,textarea,code".split(",");

xpath = "//text()[not(ancestor::" + (excludedTags.join(') and not(ancestor::')) + ")]";

linkPack = function(result, start) {
  var i, j, k, ref, ref1, ref2, ref3, startTime;
  startTime = Date.now();
  while (start + 10000 < result.snapshotLength) {
    for (i = j = ref = start, ref1 = start + 10000; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
      setLink(result.snapshotItem(i));
    }
    start += 10000;
    if (Date.now() - startTime > 2500) {
      return;
    }
  }
  for (i = k = ref2 = start, ref3 = result.snapshotLength; ref2 <= ref3 ? k <= ref3 : k >= ref3; i = ref2 <= ref3 ? ++k : --k) {
    setLink(result.snapshotItem(i));
  }
};

linkify = function(node) {
  var result;
  result = document.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
  return linkPack(result, 0);
};

linkFilter = function(node) {
  var j, len, tag;
  for (j = 0, len = excludedTags.length; j < len; j++) {
    tag = excludedTags[j];
    if (tag === node.parentNode.localName.toLowerCase()) {
      return NodeFilter.FILTER_REJECT;
    }
  }
  return NodeFilter.FILTER_ACCEPT;
};

observePage = function(root) {
  var tW;
  tW = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: linkFilter
  }, false);
  while (tW.nextNode()) {
    setLink(tW.currentNode);
  }
};

observer = new window.MutationObserver(function(mutations) {
  var Node, j, k, len, len1, mutation, ref;
  for (j = 0, len = mutations.length; j < len; j++) {
    mutation = mutations[j];
    if (mutation.type === "childList") {
      ref = mutation.addedNodes;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        Node = ref[k];
        observePage(Node);
      }
    }
  }
});

linkMixInit = function() {
  if (window !== window.top || window.document.title === "") {
    return;
  }
  linkify(document.body);
  return observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

setTimeout(linkMixInit, 100);
