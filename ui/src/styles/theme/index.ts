
import dark from './dark'
import light from './light'

export type theme = {
    [key:string]:string
}
const darkTheme:theme = {}
const lightTheme:theme = {}

let Light = (primary:string) => {
    Object.keys(light).forEach((key:string) => {
        lightTheme[`${key}`] = light[key]
    })
    lightTheme['@primary-color'] = primary
    return lightTheme
}

let Dark = (primary:string) => {
    Object.keys(dark).forEach((key:string) => {
        darkTheme[`${key}`] = dark[key]
    })
    darkTheme['@primary-color'] = primary
    return darkTheme
}

export {
    Light,
    Dark
}
