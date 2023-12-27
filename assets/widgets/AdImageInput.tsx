import React, { useState, type ReactNode } from 'react'
import { getCookie } from '../Utils'
import { type FormError } from '../Types'
import Icon from '../elements/Icon'
import { useDrag, useDrop } from 'react-dnd'

interface AdImageInputProps {
    initial?: string[]
    name: string
}

function swapElements (arr: any[], str1: any, str2: any): any[] {
    const index1 = arr.indexOf(str1)
    const index2 = arr.indexOf(str2)

    if (index1 === -1 || index2 === -1) {
        throw Error('One or both elements not found in the array.')
    }

    [arr[index1], arr[index2]] = [arr[index2], arr[index1]]

    return arr
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

    function UploadedImage ({ fileName }: { fileName: string }): React.ReactNode {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: 'BOX',
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            }),
            item: { fileName }
        }))
        const [{ canDrop }, drop] = useDrop(() => ({
            accept: 'BOX',
            canDrop: (item: Record<string, unknown>, monitor) => {
                return !(item.fileName === fileName)
            },
            drop: (item, monitor) => {
                setUploadedImages((previous) => [...swapElements(previous, item.fileName, fileName)])
            },
            collect: (monitor) => ({
                canDrop: monitor.isOver() && monitor.canDrop()
            })
        }))

        return (
            <div className={`multi-image-input@form__element ${canDrop ? 'highlighted' : ''}`} ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
                <div className="multi-image-input@form__remove">
                    <Icon name='cancel' size='small' />
                </div>
                <div className='multi-image-input@form__preview'>
                    <img src={`/media/${fileName}`} alt="preview" />
                </div>
            </div>
        )
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
                    <UploadedImage fileName={fileName} key={i} />
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
