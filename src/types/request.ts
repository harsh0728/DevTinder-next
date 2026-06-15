import {User} from "@/types/user"

export interface ConnectionRequestState {
    _id:string;
    status:string;
    fromUserId:User;
    toUserId:string;
    createdAt:string;
    updatedAt:string;
}   