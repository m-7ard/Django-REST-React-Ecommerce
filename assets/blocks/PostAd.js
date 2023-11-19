import React, { useContext, useState } from "react";

import { CSRFToken, getCookie, normalizeData, useLoginRequired } from "../Utils";
import FormField from "../elements/FormField";
import CharInput from "../widgets/CharInput";
import CharTextArea from "../widgets/CharTextarea";
import Drawer from "../widgets/Drawer";
import { CategoryContext } from "../App";
import { useNavigate } from "react-router-dom";
import newDrawer from "../widgets/newDrawer";


export default function PostAd() {
    useLoginRequired();
    const navigate = useNavigate();
    const [errors, setErrors] = useState([]);
    const { allCategories, baseCategory } = useContext(CategoryContext);

    const sanitizedCategories = normalizeData({
        data: allCategories, 
        valueKey: 'pk', 
        labelKey: 'name', 
        parentKey: 'parent'
    })
    const topLevelCategories = sanitizedCategories.filter(({parent}) => {
        return parent === baseCategory.pk;
    });

    const handleForm = async (event) => {
        event.preventDefault();
        const form = event.target.closest('form');
        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        });
        if (response.ok) {
            navigate('confirm/');
        }
        else {
            const data = await response.json();
            console.log(data)
            setErrors(data);
        }
    }

    return (
        <form className="form" method="POST" action="/api/ads/" onSubmit={handleForm}>
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
                        component: newDrawer,
                        props: {
                            className: 'form__drawer',
                            name: 'test',
                            normalizedData: sanitizedCategories,
                            topLevelChoices: topLevelCategories
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