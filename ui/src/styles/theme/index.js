
import dark from './dark'
import light from './light'

const darkTheme = {}
const lightTheme = {}

let Light = (primary) => {
    Object.keys(light).forEach((key) => {
        lightTheme[`${key}`] = light[key]
    })
    lightTheme['@primary-color'] = primary
    return lightTheme
}

let Dark = (primary) => {
    Object.keys(dark).forEach((key) => {
        darkTheme[`${key}`] = dark[key]
    })
    darkTheme['@primary-color'] = primary
    return darkTheme
}

export {
    Light,
    Dark
}
