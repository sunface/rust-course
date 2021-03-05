import { chakra, PropsOf, useColorModeValue } from "@chakra-ui/react"
import NextLink from "next/link"
import { useRouter } from "next/router"
import React from "react"

const StyledLink = React.forwardRef(function StyledLink(
  props: PropsOf<typeof chakra.a> & { isActive?: boolean },
  ref: React.Ref<any>,
) {
  const { isActive, icon,children, ...rest } = props
  return (
    <chakra.a
      aria-current={isActive ? "page" : undefined}
      width="100%"
      px="3"
      py="2"
      rounded="md"
      ref={ref}
      fontSize="1rem"
      fontWeight="bold"
      color={useColorModeValue("gray.700", "whiteAlpha.900")}
      transition="all 0.2s"
      display="flex"
      alignItems="center"
      _activeLink={{
        // bg: useColorModeValue("teal.50", "rgba(48, 140, 122, 0.3)"),
        color: useColorModeValue("teal", "teal.200"),
        fontWeight: "600",
      }}
      {...rest}
    ><chakra.span mr="5" fontSize="1.1rem" display={{base:"none",md:"block"}} width="20px">{icon}</chakra.span> <chakra.span>{children}</chakra.span></chakra.a>
  )
})

type SidebarLinkProps = PropsOf<typeof chakra.div> & {
  href?: string
  icon?: React.ReactElement
}

const SidebarLink = (props: SidebarLinkProps) => {
  const { href, icon, children, ...rest } = props

  const { asPath } = useRouter()
  const isActive = asPath.indexOf(href) > -1

  return (
    <chakra.div
      userSelect="none"
      display="flex"
      alignItems="center"
      lineHeight="1.5rem"
      {...rest}
    >
      <NextLink href={href} passHref>
        <StyledLink isActive={isActive} icon={icon}>{children}</StyledLink>
      </NextLink>
    </chakra.div>
  )
}

export default SidebarLink
