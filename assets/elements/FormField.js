import React from 'react';
import PropTypes from 'prop-types';

export default function FormField({
    widget, name, label, errors,
}) {
    const props = { ...widget.props, name };

    return (
        <div className="form__field" data-name={name}>
            <div className="form__label">
                {label}
            </div>
            <widget.component props={props} />
            {errors[name] && (
                errors[name].map((message) => (
                    <div className="form__error">
                        {message}
                    </div>
                ))
            )}
        </div>
    );
}

FormField.propTypes = {
    widget: PropTypes.shape({
        component: PropTypes.func.isRequired,
        props: PropTypes.shape({}),
    }).isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    errors: PropTypes.shape({}).isRequired,
};
