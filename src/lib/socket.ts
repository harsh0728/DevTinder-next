import {io,Socket} from "socket.io-client"

const URL='http://localhost:3001'

export const socketconnection:Socket=io(URL,{
    autoConnect:false,
    withCredentials:true,
})