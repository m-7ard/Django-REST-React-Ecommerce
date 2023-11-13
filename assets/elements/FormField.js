import React, { Fragment } from "react"


export default function FormField({ widget, name, label, errors }) {
    widget.props.name = name;

    return (
        <div className="form__field" data-name={name}>
            <div className="form__label">
                {label}
            </div>  
            {widget.class(widget.props)}
            {errors[name] && (
                errors[name].map((message) => {  
                    return (
                        <div className="form__error">
                            {message}
                        </div>
                    )
                })
            )}
        </div>
    )
};