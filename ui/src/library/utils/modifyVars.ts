import {Light, Dark} from '../../styles/theme'

export function modifyVars(model:boolean, primary:string){
    if(model){
        window.less.modifyVars(Dark(primary))
    }else{
        window.less.modifyVars(Light(primary))
    }
}
