module.exports = {
  files: [
    {
      path: "dist/index.js",
      maxSize: "500kb",
      compression: "none"
    },
    {
      path: "dist/index.mjs",
      maxSize: "450kb",
      compression: "none"
    },
    {
      path: "dist/client.js",
      maxSize: "30kb",
      compression: "none"
    },
    {
      path: "dist/client.mjs",
      maxSize: "25kb",
      compression: "none"
    },
    {
      path: "dist/server.js",
      maxSize: "20kb",
      compression: "none"
    },
    {
      path: "dist/server.mjs",
      maxSize: "18kb",
      compression: "none"
    }
  ]
}