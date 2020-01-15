/**
 * 判断是否为空
 * @param {*} value 
 * @returns {Boolean}
 */
export function isEmpty(value){
    if(value === null || value === '' || value === 'undefined' || value === undefined || value === 'null' || value.length === 0){
        return true
    } else{
        // value = value.replace(/\s/g, '')
        // if(value === ''){
        //     return true
        // }
        return false
    }
}