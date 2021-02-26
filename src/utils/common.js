import Vue from 'vue'
import axios from 'axios'
import { MessageBox } from 'element-ui';

let common = {};

common.isCheckSecoundPasswrod = (callback)=>{//檢查二級密碼
    MessageBox.prompt('Please enter the security password', 'Prompt', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancle',
        inputType:"password"
    }).then(({ value }) => {
    console.log(value)
        if(callback){
            callback(true)
        }
    }).catch(() => {
        
    });
    
};

export default common;
