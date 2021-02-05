async function redirect() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/dQHfcWF",
        permanent: true,
      },
      // GENERAL 
      {
        source: "/editor",
        destination: "/editor/articles",
        permanent: true,
      }
    ]
  }
  
  module.exports = redirect
  