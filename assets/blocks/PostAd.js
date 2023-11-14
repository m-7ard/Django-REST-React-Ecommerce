import React, { useState } from "react";

import { useLoginRequired } from "../Utils";
import FormField from "../elements/FormField";
import CharInput from "../widgets/CharInput";
import CharTextArea from "../widgets/CharTextarea";

export default function PostAd() {
    useLoginRequired();
    const [errors, setErrors] = useState([]);

    const handleForm = async (event) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });

    }

    return (
        <form className="form" method="POST" action="/api/ad/" onSubmit={handleForm}>
            <div className="form__header">
                <div className="form__title">
                    Create New Ad
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
                    name={'title'} 
                    label={'Title'} 
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'text',
                        }
                    }}
                />
                <FormField 
                    name={'price'} 
                    label={'Price'} 
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            inputmode: 'numeric',
                        }
                    }}
                />
                <FormField 
                    name={'description'} 
                    label={'Description'} 
                    errors={errors}
                    widget={{
                        component: CharTextArea,
                        props: {
                            maxlength: 256,
                        }
                    }}
                />
            </div>
            <hr className="app__divider" />
            <div className="form__footer">
                <button type="submit" className="form__submit">
                    Post Ad
                </button>
            </div>
        </form>
    )
}