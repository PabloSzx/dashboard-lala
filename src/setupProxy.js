const proxy = require("http-proxy-middleware");

module.exports = function(app) {
  app.use(
    proxy("/auth/**", {
      target: "http://localhost:80/",
    })
  );
  app.use(
    proxy("/programs/**", {
      target: "http://localhost:4000/api/v1/",
    })
  );

  app.use(
    proxy("/students/**", {
      target: "http://localhost:4000/api/v1/",
    })
  );
};
