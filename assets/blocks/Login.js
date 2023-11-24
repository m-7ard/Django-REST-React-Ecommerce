import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../elements/FormField";
import CharInput from "../widgets/CharInput";
import { UserContext } from "../App";

export default function Login() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const next = searchParams.get('next');

    useEffect(() => {
        if (user.is_authenticated) {
            navigate('/');
        }
    })

    const handleForm = async (event) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });
        if (response.ok) {
            const requestUser = await response.json();
            setUser({...requestUser, is_authenticated: true});
            navigate(next || '/');
        }
        else {
            const data = await response.json();
            setErrors(data);
        }
    }

    const [errors, setErrors] = useState([]);

    return (
        <form className="form pamphlet" method="POST" action="/api/login/" onSubmit={handleForm}>
            <div className="form__header">
                <div className="form__title">
                    Login Into Existing Account
                </div> 
            </div>
            <hr className="app__divider" />
            <div className="form__body">
                {errors.non_field_errors && (
                    <div className="form__field">
                        {
                            errors.non_field_errors.map((message) => {
                                return (
                                    <div className="form__error">
                                        {message}
                                    </div>
                                )
                            })
                        }
                    </div>

                )}
                <FormField 
                    name={'email'} 
                    label={'Email'} 
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'text',
                        }
                    }}
                />
                <FormField 
                    name={'password'} 
                    label={'Password'} 
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'password',
                        }
                    }}
                />
            </div>
            <hr className="app__divider" />
            <div className="form__footer">
                <Link to={'/register/'}>
                    <div className="app__link">
                        Don't have an account?
                    </div>
                </Link>
                <button type="submit" className="form__submit">
                    Login
                </button>
            </div>
        </form>
    )
}