import httpRequest from '@/utils/httpRequest' // api: https://github.com/axios/axios
import { MessageBox,Message } from 'element-ui';

let common = {};

common.isCheckSecoundPasswrod = (callback)=>{//檢查二級密碼
    MessageBox.prompt('Please enter the security password', 'Prompt', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancle',
        inputType:"password"
    }).then(({ value }) => {
        if(value !== null || value !== ''){
            if(callback){
                httpRequest({
                    url: httpRequest.adornUrl('/user/pc/secondary/password'),
                    method: 'post',
                    data: httpRequest.adornData({
                        secondPassword:value
                    })
                }).then(({data}) => {
                    console.log(data)
                    if (data && data.code === 20000) {
                        callback(true)
                    } else {
                        Message({
                            showClose: true,
                            message: data.msg,
                            type: 'error'
                        });
                    }
                })
            }
        }else{
            if(callback){
                callback(false)
            }
        }
        
    }).catch(() => {
        if(callback){
            callback(false)
        }
    });
    
};

export default common;
