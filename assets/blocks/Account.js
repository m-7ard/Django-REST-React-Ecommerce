import React from "react";
import { useLoginRequired } from "../Utils";

export default function Account() {
    useLoginRequired();

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