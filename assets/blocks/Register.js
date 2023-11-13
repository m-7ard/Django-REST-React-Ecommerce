import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../elements/FormField";
import PillSelect from "../widgets/PillSelect";
import CharInput from "../widgets/CharInput";


export default function Register() {
    const navigate = useNavigate();
    const handleForm = async (event) => {
        event.preventDefault();
        
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });
        if (response.ok) {
            navigate('/');
        }
        else {
            const data = await response.json();
            console.log(data)

            setErrors(data);
        }
    }

    const [errors, setErrors] = useState([]);


    return (
        <div className="account">
            <div className="account__auth">
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
                                class: PillSelect,
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
                                class: CharInput,
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
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}