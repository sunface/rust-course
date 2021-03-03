import React from "react"
import {chakra, PropsOf, IconButton } from "@chakra-ui/react"

type Props = PropsOf<typeof chakra.div> & {
    icon: 'bookmark' | 'edit' | 'share'
    onClick: any
    height?: string
}


export const SvgButton= (props:Props) =>{
    const {icon,height="1.7rem",...rest} = props

    let iconSvg 
    switch (icon) {
        case "bookmark":
            iconSvg = <svg height={height} fill="currentColor" viewBox="0 0 384 512"><path d="M336 0H48C21.49 0 0 21.49 0 48v464l192-112 192 112V48c0-26.51-21.49-48-48-48zm16 456.287l-160-93.333-160 93.333V48c0-8.822 7.178-16 16-16h288c8.822 0 16 7.178 16 16v408.287z"></path></svg>
            break;
        case "share":
            iconSvg = <svg height="1.7rem" fill="currentColor" viewBox="0 0 448 512"><path d="M352 320c-28.6 0-54.2 12.5-71.8 32.3l-95.5-59.7c9.6-23.4 9.7-49.8 0-73.2l95.5-59.7c17.6 19.8 43.2 32.3 71.8 32.3 53 0 96-43 96-96S405 0 352 0s-96 43-96 96c0 13 2.6 25.3 7.2 36.6l-95.5 59.7C150.2 172.5 124.6 160 96 160c-53 0-96 43-96 96s43 96 96 96c28.6 0 54.2-12.5 71.8-32.3l95.5 59.7c-4.7 11.3-7.2 23.6-7.2 36.6 0 53 43 96 96 96s96-43 96-96c-.1-53-43.1-96-96.1-96zm0-288c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM96 320c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zm256 160c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z"></path></svg>
            break
        case "edit":
            iconSvg = <svg height="1.5rem" fill="currentColor" viewBox="0 0 512 512"><path d="M493.255 56.236l-37.49-37.49c-24.993-24.993-65.515-24.994-90.51 0L12.838 371.162.151 485.346c-1.698 15.286 11.22 28.203 26.504 26.504l114.184-12.687 352.417-352.417c24.992-24.994 24.992-65.517-.001-90.51zm-95.196 140.45L174 420.745V386h-48v-48H91.255l224.059-224.059 82.745 82.745zM126.147 468.598l-58.995 6.555-30.305-30.305 6.555-58.995L63.255 366H98v48h48v34.745l-19.853 19.853zm344.48-344.48l-49.941 49.941-82.745-82.745 49.941-49.941c12.505-12.505 32.748-12.507 45.255 0l37.49 37.49c12.506 12.506 12.507 32.747 0 45.255z"></path></svg>
            break
        default:
            break;
    }
    return (
        <IconButton
                      aria-label="a icon button"
                      variant="ghost"
                      _focus={null}
                      icon={iconSvg}
                      {...rest}
        />
    )
} 

export default SvgButton
