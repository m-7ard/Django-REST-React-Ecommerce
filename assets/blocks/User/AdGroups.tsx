import React, { useState } from 'react'
import { useLoaderData, useRevalidator } from 'react-router-dom'
import { type AdGroup } from '../../Types'
import Icon from '../../elements/Icon'
import { CharInputWidget } from '../../widgets/CharInput'
import GenericFormPrompt from '../../elements/GenericFormPrompt'

function CreateAdGroup ({ revalidate }: {
    revalidate: () => void
}): React.ReactNode {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div onClick={() => {
                setOpen(true)
            }}>
                <Icon name="add" size="small" hoverable />
            </div>
            {
                open && (
                    <GenericFormPrompt
                        action={'/api/ad-groups/'}
                        title={'Create New Ad Group'}
                        method='POST'
                        fields={[
                            {
                                name: 'name',
                                label: 'Name',
                                widget: CharInputWidget({})
                            }
                        ]}
                        button={{
                            label: 'Create'
                        }}
                        onSuccess={async () => {
                            setOpen(false)
                            revalidate()
                        }}
                        onClose={() => {
                            setOpen(false)
                        }}
                        hasCSRF
                    />
                )
            }
        </>
    )
}

function EditAdGroup ({ revalidate, adGroup }: {
    revalidate: () => void
    adGroup: AdGroup
}): React.ReactNode {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className='prop__button' onClick={() => {
                setOpen(true)
            }}>
                Edit
            </div>
            {
                open && (
                    <GenericFormPrompt
                        action={`/api/ad-groups/${adGroup.pk}/`}
                        title={`Edit ${adGroup.name}`}
                        method='PATCH'
                        fields={[
                            {
                                name: 'name',
                                label: 'Name',
                                widget: CharInputWidget({
                                    initial: adGroup.name
                                })
                            }
                        ]}
                        button={{
                            label: 'Edit'
                        }}
                        onSuccess={async () => {
                            setOpen(false)
                            revalidate()
                        }}
                        onClose={() => {
                            setOpen(false)
                        }}
                        hasCSRF
                    />
                )
            }
        </>
    )
}

export default function AdGroups (): React.ReactNode {
    const adGroups = useLoaderData() as AdGroup[]
    const revalidator = useRevalidator()

    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Ad Groups
                </div>
            </div>
            <div className="prop prop--vertical prop--highlighted">
                <div className="prop__header">
                    <div className="prop__label">
                        Create New Group
                    </div>
                    <CreateAdGroup revalidate={revalidator.revalidate} />
                </div>
            </div>
            {
                adGroups.map((adGroup, i) => (
                    <div className='prop prop--vertical prop--highlighted' key={i}>
                        <div className='prop__header'>
                            <div className='prop__info'>
                                {adGroup.name}
                            </div>
                        </div>
                        <div className='prop__row'>
                            <EditAdGroup adGroup={adGroup} revalidate={revalidator.revalidate} />
                            <div className='prop__button'>
                                Delete
                            </div>
                        </div>
                    </div>
                ))
            }

        </div>
    )
}
