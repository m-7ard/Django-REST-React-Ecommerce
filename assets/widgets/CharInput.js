/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

export default function CharInput({initial, ...props}) {
    return (
        <input defaultValue={initial} className="form__char-input" {...props} />
    );
}
