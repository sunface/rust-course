async function redirect() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/dQHfcWF",
        permanent: true,
      },
      // GENERAL
      {
        source: "/getting-started",
        destination: "/docs/getting-started",
        permanent: true,
      }
    ]
  }
  
  module.exports = redirect
  