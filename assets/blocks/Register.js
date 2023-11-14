import React, { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../elements/FormField";
import PillSelect from "../widgets/PillSelect";
import CharInput from "../widgets/CharInput";
import { UserContext } from "../App";


export default function Register() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

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
            navigate('/');
        }
        else {
            const data = await response.json();
            setErrors(data);
        }
    }

    const [errors, setErrors] = useState([]);


    return (
        <form className="form" method="POST" action="/api/register/" onSubmit={handleForm}>
            <div className="form__header">
                <div className="form__title">
                    Register New Account
                </div> 
            </div>
            <hr className="app__divider" />
            <div className="form__body">
                <FormField 
                    name={'account_type'} 
                    label={'Account Type'} 
                    errors={errors}
                    widget={{
                        component: PillSelect,
                        props: {
                            choices: [
                                {label: 'Individual', value: 'individual'},
                                {label: 'Business', value: 'business'},
                            ]
                        }
                    }}
                />
                <FormField 
                    name={'display_name'} 
                    label={'Display Name'} 
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'text',
                        }
                    }}
                />
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
                <Link to={'/login/'}>
                    <div className="app__link">
                        Already have an account?
                    </div>
                </Link>
                <button type="submit" className="form__submit">
                    Register
                </button>
            </div>
        </form>
    )
}