"use client"
import { useAppSelector } from "@/store/hooks";
import Navbar from "./Navbar";

export default function NavbarWrapper(){
    const user=useAppSelector((state)=>state.user.user);
    return user?<Navbar/>:null;
}