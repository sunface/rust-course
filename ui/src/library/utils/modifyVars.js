import {Light, Dark} from '@styles/theme'

export function modifyVars(model, primary){
    //window.less.modifyVars(vars)
    if(model){
        window.less.modifyVars(Dark(primary))
    }else{
        window.less.modifyVars(Light(primary))
    }
}

// export function modifyModel(model){
//     // let {dark, light} = theme
//     // let dark = Dark
//     // console.log(Dark())
//     // console.log(Light())
    
// }