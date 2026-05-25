(function () {
  if (!window.SITE_BASE_PATH) {
    const pathname = window.location.pathname;
    let basePath = pathname;

    if (!pathname.endsWith("/")) {
      const lastSegment = pathname.substring(pathname.lastIndexOf("/") + 1);
      const fileLikeSegment = /\.[^/]+$/.test(lastSegment);
      const knownFileExtension = /\.(html?|php|asp|aspx|json|xml|js|css|svg|png|jpe?g|gif|map)$/i;

      if (fileLikeSegment && knownFileExtension.test(lastSegment)) {
        basePath = pathname.replace(/[^/]*$/, "");
      } else {
        basePath = `${pathname}/`;
      }
    }

    window.SITE_BASE_PATH = basePath;
  }

  if (!window.resolveSitePath) {
    window.resolveSitePath = function (relativePath) {
      return `${window.SITE_BASE_PATH}${relativePath}`;
    };
  }
})();
