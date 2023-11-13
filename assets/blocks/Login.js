import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../elements/FormField";
import CharInput from "../widgets/CharInput";
import { UserContext } from "../App";

export default function Login() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, setUser } = useContext(UserContext);
    const next = searchParams.get('next');
    const handleForm = async (event) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });
        if (response.ok) {
            setUser(await response.json());
            navigate(next || -1);
        }
        else {
            const data = await response.json();
            setErrors(data);
        };
    }

    const [errors, setErrors] = useState([]);

    return (
        <div className="account">
            <div className="account__auth">
                <form className="form" method="POST" action="/api/login/" onSubmit={handleForm}>
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
                                class: CharInput,
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
                                class: CharInput,
                                props: {
                                    type: 'password',
                                }
                            }}
                        />
                        <button type="submit" className="form__submit">
                            Login
                        </button>
                    </div>

                </form>


            </div>
        </div>
    )
}