import React from "react"
import { Box, BoxProps, HStack, useRadioGroup } from "@chakra-ui/react"
import { EditMode } from "src/types/editor"
import RadioCard from "./radio-card"

interface Props {
  onChange : any
}
export const EditModeSelect = (props: Props) => {
  const editOptions = [EditMode.Edit, EditMode.Preview]
  const { getRootProps, getRadioProps } = useRadioGroup({
      name: "framework",
      defaultValue: EditMode.Edit,
      onChange: (v) => {
          props.onChange(v)
      },
  })
  const group = getRootProps()
  return (
    <HStack {...group}>
    {editOptions.map((value) => {
        const radio = getRadioProps({ value })
        return (
            <RadioCard key={value} {...radio} bg="teal" color="white">
                {value}
            </RadioCard>
        )
    })}
</HStack>
  )
} 

export default EditModeSelect
