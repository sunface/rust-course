import { Box, useRadio } from "@chakra-ui/react"

function RadioCard(props) {
    const { getInputProps, getCheckboxProps} = useRadio(props)
  
    const input = getInputProps()
    const checkbox = getCheckboxProps()
  
    return (
      <Box as="label">
        <input {...input} />
        <Box
          {...checkbox}
          cursor="pointer"
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
          _checked={{
            bg: props.bg,
            color: props.color,
            borderColor: props.bg,
          }}
          _focus={{
            boxShadow: "outline",
          }}
          px={2}
          py={1}
        >
          {props.children}
        </Box>
      </Box>
    )
}

export default RadioCard