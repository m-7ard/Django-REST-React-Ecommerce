import React, { useState, type ReactNode } from 'react'
import { getCookie } from '../Utils'
import { type FormError } from '../Types'
import Icon from '../elements/Icon'

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
        const response = await fetch('/api/validate_image/', {
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

    async function addImagesToUpload (event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
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
        <div className="multi-image-input@form">
            <input name={name} value={JSON.stringify(uploadedImages)} type="hidden" />
            <div className='multi-image-input@form__body prop prop--horizontal'>
                <div className='multi-image-input@form__element is-input' onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    void addImagesToUpload(event)
                }}>
                    <Icon name='add_photo_alternate' size='large' />
                    <input type="file" multiple />
                </div>
                {uploadedImages.map((fileName, i) => (
                    <div className="multi-image-input@form__element" key={i}>
                        <div className="multi-image-input@form__remove">
                            <Icon name='cancel' size='small' />
                        </div>
                        <div className='multi-image-input@form__preview'>
                            <img src={`/media/${fileName}`} alt="preview" />
                        </div>
                    </div>
                ))}
            </div>
            <div>
                {stagedImages.map(({ name }, i) => (
                    <div className="multi-image-input@form__uploading" key={i}>
                        <Icon name='refresh' size='small' />
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
