// Picks the right Worker for where the page is running. The same file is used on every branch.
(function () {
  var host = location.hostname, path = location.pathname;
  var env = (host === "localhost" || host === "127.0.0.1") ? "local"
          : /\/staging(\/|$)/.test(path) ? "staging" : "production";
  var PROXIES = {
    production: "https://news-reader-proxy.sejoyce.workers.dev",
    staging: "https://news-reader-proxy-staging.sejoyce.workers.dev",
    local: "http://localhost:8787"
  };
  window.NEWS_READER = { proxyUrl: PROXIES[env], env: env };
  if (env !== "production") {
    document.title += " (" + env + ")";
    document.addEventListener("DOMContentLoaded", function () {
      var t = document.querySelector("h1, .bar strong");
      if (t) t.textContent += " (" + env + ")";
    });
  }
})();
