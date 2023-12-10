import React, { type ChangeEvent, useState, type ReactNode } from 'react'
import { getCookie } from '../Utils'
import { type FormError } from '../Types'

interface AdImageInputProps {
    initial?: string[]
    name: string
}

export default function AdImageInput ({ initial, name }: AdImageInputProps): ReactNode {
    const [stagedImages, setStagedImages] = useState<File[]>([])
    const [uploadedImages, setUploadedImages] = useState(initial ?? [])
    const [errors, setErrors] = useState<FormError[]>([])

    async function processFile (file: File): Promise<void> {
        // We use FormData for simplicity sake so we can
        // access tbe file directly in the Django request.FILES
        const formData = new FormData()
        setStagedImages((previous) => [...previous, file])
        formData.append('image', file)

        const csrfToken = getCookie('csrftoken')
        const response = await fetch('/validate_image/', {
            method: 'POST',
            headers: (csrfToken == null) ? undefined : { 'X-CSRFToken': csrfToken },
            body: formData
        })
        if (response.ok) {
            const { fileName } = await response.json()
            setUploadedImages((previous) => [...previous, fileName])
        }
        else {
            const error = await response.json()
            setErrors((previous) => [...previous, error])
        }
        setStagedImages((previous) => previous.filter((image) => image !== file))
    }

    async function addImagesToUpload (event: ChangeEvent<HTMLInputElement>): Promise<void> {
        setErrors([])

        const { files } = event.target
        if (files == null) {
            return
        }

        const promises = []
        for (let i = 0; i < files.length; i += 1) {
            const file = files[i]
            promises.push(processFile(file))
        }
        await Promise.all(promises)
    }

    return (
        <div className="form__multi-image-input">
            <div data-role="widget">
                <div data-role="image-button" onChange={addImagesToUpload}>
                    <div className="icon icon--large">
                        <i className="material-icons">
                            add_photo_alternate
                        </i>
                    </div>
                    <input type="file" multiple />
                </div>
                {uploadedImages.map((fileName, i) => (
                    <div data-role="image-button" key={i}>
                        <div data-role="image-preview">
                            <img src={`/media/${fileName}`} alt="preview" />
                        </div>
                        <input name={name} value={fileName} type="hidden" />
                    </div>
                ))}

            </div>
            <div data-role="messages">
                {stagedImages.map(({ name }, i) => (
                    <div data-role="uploading" key={i}>
                        <div className="icon icon--small">
                            <i className="material-icons">
                                refresh
                            </i>
                        </div>
                        <div className="form__helper-text">
                            Uploading:
                            {' '}
                            {name}
                        </div>
                    </div>
                ))}
                {errors.map((error, i) => (
                    <div className="form__error" key={i}>
                        {error.name}
                        :
                        {error.msg}
                    </div>
                ))}
            </div>
        </div>
    )
}

export function AdImageInputWidget (props: Omit<AdImageInputProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => AdImageInput({ name, ...props })
}
