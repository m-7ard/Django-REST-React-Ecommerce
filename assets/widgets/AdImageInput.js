import React, { useState } from "react";
import { getCookie } from "../Utils";


export default function AdImageInput({initial, name}) {
    async function addImagesToUpload(event) {
        setErrors([]);

        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            const file = files[i];
            setStagedImages((previous) => [...previous, file]);
            formData.append('image', file);
            const response = await fetch('/validate_image/', {
                method: 'POST',
                headers: { 
                    "X-CSRFToken": getCookie('csrftoken'),
                },
                body: formData
            });
            if (response.ok) {
                const { fileName } = await response.json();
                setUploadedImages((previous) => [...previous, fileName]);
            }
            else {
                const error = await response.json();
                setErrors((previous) => [...previous, error]);
            }
            setStagedImages((previous) => previous.filter((image) => image !== file));
        }
    }

    const [stagedImages, setStagedImages] = useState([]);
    const [uploadedImages, setUploadedImages] = useState(initial || []);
    const [errors, setErrors] = useState([])

    return (
        <div className="form__multi-image-input">
            <div data-role="widget">
                <div data-role="image-button" onChange={addImagesToUpload}>
                    <div className="icon icon--large">
                        <i className="material-icons">
                            'add_photo_alternate'
                        </i>
                    </div>
                    <input type="file" multiple />
                </div>
                {uploadedImages.map((fileName) => {
                    return (
                        <div data-role="image-button">
                            <div data-role="image-preview">
                                <img src={`/media/${fileName}`} />
                            </div>
                            <input name={name} value={fileName} type="hidden"/>
                        </div>
                    )
                })}

            </div>
            <div data-role="messages">
                {stagedImages.map(({name}) => {
                    return (
                        <div data-role="uploading">
                            <div className="icon icon--small">
                                <i className="material-icons">
                                    'refresh'
                                </i>
                            </div>
                            <div className="form__helper-text">
                                Uploading: {name}
                            </div>
                        </div>
                    )
                })}
                {errors.map(({name, msg}) => {
                    return (
                        <div className="form__error">
                            {name}: {msg}
                        </div>
                    )
                })}
            </div>
        </div>

    )
}