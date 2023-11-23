import React, { useState } from "react";
import { fileListToBase64, getCookie } from "../Utils";


export default function AdImageInput({name}) {
    async function addImagesToUpload(event) {
        const files = event.target.files;
        const base64Files = await fileListToBase64(files);
        const formData = new FormData()
        Array.from(files).forEach((image) => {
            formData.append('images', image);
        })

        await fetch('/validate_ad_images/', {
            method: 'POST',
            headers: { 
                "X-CSRFToken": getCookie('csrftoken'),
            },
            body: formData
        })
        
        setStagedImages([...stagedImages]);
    }

    const [stagedImages, setStagedImages] = useState([]);

    return (
        <div className="form__multi-image-input">
            <div data-role="image-button" onChange={addImagesToUpload}>
                <div className="icon icon--large">
                    <i className="material-icons">
                        'add_photo_alternate'
                    </i>
                </div>
                <input name={name} type="file" multiple />
            </div>
            {stagedImages.map((url) => {
                return (
                    <div data-role="image-button">
                        <div data-role="image-preview">
                            <img src={url} />
                        </div>
                    </div>
                )
            })}

        </div>
    )
}