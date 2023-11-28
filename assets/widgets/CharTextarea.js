import React from "react";


export default function CharTextArea({initial, ...props}) {
    return (
        <textarea defaultValue={initial} className="form__char-textarea" {...props} rows={5} />
    )
}