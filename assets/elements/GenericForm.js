import React, { useState } from "react";
import FormField from "./FormField";
import { CSRFToken, getCookie } from "../Utils";


export default function GenericForm({action, extraClass, method, title, button, resettable, fields, onSuccess, hasCSRF }) {
    const [errors, setErrors] = useState([]);
    
    async function handleForm (event) {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: method,
            body: new FormData(form),
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });
        if (response.ok) {
            await onSuccess(response);
        }
        else {
            const data = await response.json();
            setErrors(data);
        }
    }

    return (
        <form action={action} className={`form prop prop--vertical ${extraClass}`} onSubmit={handleForm}>
            <div className="prop__header">
                <div className="prop__title">
                    {title}
                </div> 
            </div>
            <hr className="app__divider" />
            <div className="prop__body grow">
                {(hasCSRF === true) && <CSRFToken />}
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
                {fields.map((field) => {
                    return (
                        <FormField {...field} errors={errors} />
                    );
                })}
            </div>
            <hr className="app__divider" />
            <div className="prop__footer">
                {resettable && (
                    <button className="form__reset" type="reset">Reset</button>
                )}
                <button type="submit" className="form__submit">
                    {button.label}
                </button>
            </div>
        </form>
    )
}