import { extendTheme } from "@chakra-ui/react"
const theme = extendTheme()
const  userCustomTheme = {
    borderColor: {
        light: theme.colors.gray['200'], 
        dark: theme.colors.whiteAlpha['300']
    }
}

export default userCustomTheme