import React from "react"
import { IconButton, useColorMode, useColorModeValue } from "@chakra-ui/react"
import { FaMoon, FaSun } from "react-icons/fa"

export const DarkMode = (props) => {
    const { toggleColorMode: toggleMode } = useColorMode()
    const text = useColorModeValue("dark", "light")
    const SwitchIcon = useColorModeValue(FaMoon, FaSun)

    return (
        <IconButton
            size="md"
            fontSize={props.fontSize??'lg'}
            aria-label={`Switch to ${text} mode`}
            variant="ghost"
            color="current"
            onClick={toggleMode}
            _focus={null}
            icon={<SwitchIcon />}
        />
    )
}

export default DarkMode
