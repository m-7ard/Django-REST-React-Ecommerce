import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";


export default function AdConfirmation() {
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => { 
        if (!state) {
            navigate({
                pathname: "/",
            });
        }
    }, [])


    return (
        <div className="confirmation pamphlet">
            <div className="icon confirmation__icon">
                <i className="material-icons">
                    task_alt
                </i>
            </div>
            <div className="confirmation__title">
                Ad Successfully Created
            </div>
            <section className="confirmation__section">
                <Link to={`/ad/${state.pk}`}>
                    <div className="confirmation__button confirmation__button--ad">
                        Go To Ad
                    </div>
                </Link>
                <Link to={`/post-ad/`}>
                    <div className="confirmation__button confirmation__button--new">
                        Post Another Ad
                    </div>
                </Link>
            </section>
        </div>
    )
}