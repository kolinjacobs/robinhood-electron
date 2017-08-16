/*Route ipc requests to the robinhood api*/
import { app, BrowserWindow, ipcMain } from 'electron'
import _ from 'lodash';
import RobinHood from './RobinHood';
let rh = new RobinHood();

/*
This is just to replace the API / router of the web version of this app.  Robinhood_username is set as My Account for compatibility
*/

export default {
  start() {
    ipcMain.on('post', async function(event, arg){
      let requestId = _.clone(arg.requestId);
      delete arg['requestId'];

      try{
        if(arg.url.indexOf('user')){
          if(arg.url == '/user/login'){
            let loginResult = await rh.connect(arg.username, arg.password);
            event.sender.send(requestId, {err: null, result: loginResult, userData: {robinhood_username: "My Account"}});
            return;
          }

          if(arg.url == '/user/checkLoginState'){
            if(typeof rh.api.token !== 'undefined' && rh.api.token != null){
              event.sender.send(requestId, {err: null, result: true, userData: {robinhood_username: "My Account"}});
            }else{
              event.sender.send(requestId, {err: null, result: false, userData: null});
            }

            return;
          }
        }

        let action = arg.url.replace('/robinhood/', '');

        delete arg['url'];

        console.log("passing action " + action + " with data ", Object.values(arg));

        let result = await rh[action].apply(rh.context, Object.values(arg));

        event.sender.send(requestId, {err: null, result: result});
        return;
      }catch(e){
        event.sender.send(requestId, {err: e.toString(), result: null});
      }
    });
    /*
    ipcMain.on('post', async function(event, arg){
      try{
        if(arg.url.indexOf('user')){
          if(arg.url == '/user/login'){
            let loginResult = await rh.connect(arg.username, arg.password);
            event.returnValue = {err: null, result: loginResult};
            return;
          }

          if(arg.url == '/user/checkLoginState'){
            if(typeof rh.api.token !== 'undefined' && rh.api.token != null){
              event.returnValue = {err: null, result: true, userData: {}};
            }else{
              event.returnValue = {err: null, result: false, userData: null};
            }

            return;
          }
        }

        let action = arg.url.replace('/robinhood/', '');

        delete arg['url'];

        console.log("passing action " + action + " with data ", Object.values(arg));

        let result = await rh[action].apply(rh.context, Object.values(arg));

        event.returnValue = {err: null, result: result};
      }catch(e){
        event.returnValue = {err: e.toString(), result: null};
      }
    });*/
    /*
    ipcMain.on('/user/login', function(event, arg){
      (async () => {
        try{
          let loginResult = await rh.connect(arg.username, arg.password);
          event.returnValue = {err: null, result: loginResult};
        }catch(e){
          event.returnValue = {err: e.toString(), result: null};
        }
      })();
    });

    ipcMain.on('/user/checkLoginState', function(event, arg){
      (async () => {
        try{
          if(typeof rh.api.token !== 'undefined' && rh.api.token != null){
            event.returnValue = {err: null, result: true, userData: {}};
          }else{
            event.returnValue = {err: null, result: false, userData: null};
          }
        }catch(e){
          event.returnValue = {err: e.toString(), result: null};
        }
      })();
    });

    ipcMain.on('/robinhood/getAccounts', async function(event, arg){
      try{

      }catch(e){
        return res.json({})
      }
    });*/
  }
}