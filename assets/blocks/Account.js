import React, { useContext, useEffect } from "react";
import { createSearchParams, useNavigate } from "react-router-dom";
import { UserContext } from "../App";

export default function Account() {
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    useEffect(() => { 
        if (!user) {
            navigate({
                pathname: "/login/",
                search: createSearchParams({
                    next: "/account/"
                }).toString();
            });
        }
    }, [])


    return (
        <div className="account">
            <form className="account__auth" method="POST" action="/api/categories/1/">
                <div className="account__title">
                    Account
                </div>
            </form>
        </div>
    )
}