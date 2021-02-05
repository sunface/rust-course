import { trackPageview } from "analytics/track-event"
import { DefaultSeo } from "next-seo"
import Head from "next/head"
import Router from "next/router"
import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import theme from "theme"
import FontFace from "src/components/font-face"
import { getSeo } from "utils/seo"
import GAScript from "analytics/ga-script"
import {initUIConfig} from 'src/utils/config'

Router.events.on("routeChangeComplete", (url) => {
  trackPageview(url)
})

const App = ({ Component, pageProps }) => {
  const seo = getSeo({ omitOpenGraphImage: false })

  initUIConfig()
  return (
    <>
      <Head>
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://static.cloudflareinsights.com" />
        <meta name="theme-color" content="#319795" />
      </Head>
      <DefaultSeo {...seo} />
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
      <GAScript />
      <FontFace />
    </>
  )
}

export default App
