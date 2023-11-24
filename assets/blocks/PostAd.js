import React, { useState } from "react";

import { CSRFToken, useLoginRequired } from "../Utils";
import FormField from "../elements/FormField";
import CharInput from "../widgets/CharInput";
import CharTextArea from "../widgets/CharTextarea";
import { useNavigate } from "react-router-dom";
import CategoryPicker from "../widgets/CategoryPicker";
import AdImageInput from "../widgets/AdImageInput";



export default function PostAd() {
    useLoginRequired();
    const navigate = useNavigate();
    const [errors, setErrors] = useState([]);


    const handleForm = async (event) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });
        if (response.ok) {
            const ad = await response.json();
            navigate('success/', {state: ad});
        }
        else {
            const data = await response.json();
            setErrors(data);
        }
    }

    return (
        <form className="form pamphlet" method="POST" action="/api/ads/" onSubmit={handleForm}>
            <CSRFToken/>
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
                            maxLength: 64,
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
                            inputMode: 'numeric',
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
                            maxLength: 4096,
                        }
                    }}
                />
                <FormField 
                    name={'category'} 
                    label={'Category'} 
                    errors={errors}
                    widget={{
                        component: CategoryPicker,
                        props: {},
                    }}
                />
                <FormField 
                    name={'images'} 
                    label={'Images'} 
                    errors={errors}
                    widget={{
                        component: AdImageInput,
                        props: {},
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