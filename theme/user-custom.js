import { extendTheme } from "@chakra-ui/react"
const theme = extendTheme()
const  userCustomTheme = {
    borderColor: {
        light: theme.colors.gray['200'], 
        dark: theme.colors.whiteAlpha['300']
    },
    hoverBg: {
        light: theme.colors.gray['100'], 
        dark: theme.colors.whiteAlpha['200']
    }
}

export default userCustomTheme