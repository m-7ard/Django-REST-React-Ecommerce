import React from "react";


export default function AdImageInput({name}) {
    function addImagesToUpload(event) {
        const input = event.target;
        console.log(input.files)
        /* TODO: keep working on this, check old project attachment stuff
         */
    }

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
            <div data-role="image-button">
        
            </div>
        </div>
    )
}