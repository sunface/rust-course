async function redirect() {
    return [
      {
        source: "/search",
        destination: "/search/posts",
        permanent: true,
      }
    ]
  }
  
  module.exports = redirect
  