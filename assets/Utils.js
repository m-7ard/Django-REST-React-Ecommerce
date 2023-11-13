import React, { useContext, useEffect } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./App";

export function useLoginRequired() {
    const { user, setUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => { 
        if (!user) {
            navigate({
                pathname: "/login/",
                search: createSearchParams({
                    next: location.pathname
                }).toString()
            });
        }
    }, [])
}