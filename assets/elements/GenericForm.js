import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import { CSRFToken, getCookie } from '../Utils';

function GenericForm({
    action, extraClass, method, title, button, resettable, fields, onSuccess, hasCSRF,
}) {
    const [errors, setErrors] = useState({});

    async function handleForm(event) {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method,
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
                            errors.non_field_errors.map((message) => (
                                <div className="form__error">
                                    {message}
                                </div>
                            ))
                        }
                    </div>
                )}
                {fields.map(({widget, name, label}) => (
                    <FormField widget={widget} name={name} label={label} errors={errors} />
                ))}
            </div>
            <hr className="app__divider" />
            <div className="prop__footer">
                {resettable && (
                    <input className="form__reset" type="reset" />
                )}
                <button type="submit" className="form__submit">
                    {button.label}
                </button>
            </div>
        </form>
    );
}

GenericForm.defaultProps = {
    extraClass: '',
    button: 'submit',
    resettable: false,
    fields: [],
    hasCSRF: false,
};

GenericForm.propTypes = {
    action: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        widget: PropTypes.shape({
            component: PropTypes.func.isRequired,
            props: PropTypes.shape({}),
        }),
    })),
    resettable: PropTypes.bool,
    button: PropTypes.shape({
        label: PropTypes.string,
    }),
    method: PropTypes.oneOf(['POST', 'GET', 'PUT', 'PATCH', 'DELETE']).isRequired,
    extraClass: PropTypes.string,
    onSuccess: PropTypes.func.isRequired,
    hasCSRF: PropTypes.bool,
};

export default GenericForm;
