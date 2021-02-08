import { mode } from "@chakra-ui/theme-tools"
import userCustomTheme from "./user-custom"

export default function reactMarkdownStyles(props) {
    return  {
        '.rc-md-editor': {
            borderWidth: '0px',
            background: 'transparent',
            textarea: {
                background: 'transparent!important',
                color: mode("#2D3748!important", "rgba(255, 255, 255, 0.92)!important")(props),
            },
            '.rc-md-navigation' :{
                background: 'transparent',
                borderBottomColor: mode(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark + '!important')(props),
                '.navigation-nav' :{
                    '.button': {
                        color: mode("#2D3748!important", "rgba(255, 255, 255, 0.92)!important")(props),
                    }
                }
            },
            '.drop-wrap' : {
                background: mode("white", "#1A202C")(props),
                borderWidth: '1px',
                borderColor: mode(userCustomTheme.borderColor.light, userCustomTheme.borderColor.dark + '!important')(props),
            },
            '.header-list .list-item': {
                _hover: {
                    background: 'transparent'
                }
            }
        }
    }
}