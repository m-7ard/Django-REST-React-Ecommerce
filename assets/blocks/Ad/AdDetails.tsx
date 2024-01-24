import React, { useRef, useState } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router-dom'
import { getAdData } from '../../Fetchers'
import { useCartContext, useCategoryContext } from '../../Context'
import { NormalizedData, addDotsToNumber, normalizeData } from '../../Utils'
import { type AdGroup, type BaseAd } from '../../Types'
import Prompt from '../../elements/Prompt'

export async function loader ({ params }: { params: { pk: number } }): Promise<BaseAd> {
    const ad = await getAdData(params.pk)
    return ad
}

function AmountController ({ ad }: { ad: BaseAd }): React.ReactNode {
    const soldOut = ad.available === 0
    const [amount, setAmount] = useState(soldOut ? 0 : 1)

    return (
        <div className='prop__row prop__row--centered'>
            <div className='prop__label'>
                Amount
            </div>
            <input defaultValue={amount} max={ad.available} className='ad-details__amount' type='number' />
            <div className='prop__detail'>
                {soldOut ? 'Sold Out' : `${ad.available} Available`}
            </div>
        </div>
    )
}

function SpecificationsSelect ({ groupData, initial }: {
    groupData: AdGroup
    initial: Record<string, string>
}): React.ReactNode {
    const navigate = useNavigate()
    const normalizedInitial = Object.entries(initial).reduce<
    Array<{ fieldName: string, fieldValue: string }>
    >((acc, [fieldName, fieldValue]) => {
        acc.push({ fieldName, fieldValue })
        return acc
    }, [])
    const [selected, setSelected] = useState(normalizedInitial)

    // Ads that contain at least all the selected fields
    const subsetAds = groupData.ads.filter(({ specifications }) => {
        return selected.every(({ fieldName, fieldValue }) => specifications[fieldName] === fieldValue)
    })

    /*
        Ads that have specifications entries of the same length or bigger
        than the selected options, and have all fields, except 1
        matching, meaning we could switch over to that field
        without ending up on an invalid route.
    */
    const switchableAds = groupData.ads.filter(({ specifications }) => {
        const validLength = Object.entries(specifications).length >= selected.length
        if (!validLength) {
            return false
        }
        const matchingEntriesAmount = selected.reduce((acc, { fieldName, fieldValue }) => specifications[fieldName] === fieldValue ? acc + 1 : acc, 0)
        return matchingEntriesAmount >= selected.length - 1
    })

    const selectableOptions: Record<string, Set<string>> = {}

    subsetAds.forEach(({ specifications }) => {
        Object.entries(specifications).forEach(([fieldName, fieldValue]) => {
            if (selectableOptions[fieldName] == null) {
                selectableOptions[fieldName] = new Set([fieldValue])
            }
            else {
                selectableOptions[fieldName].add(fieldValue)
            }
        })
    })

    switchableAds.forEach(({ specifications }) => {
        selected.forEach(({ fieldName }) => {
            if (specifications[fieldName] == null) {
                return
            }

            if (selectableOptions[fieldName] == null) {
                selectableOptions[fieldName] = new Set(specifications[fieldName])
            }
            else {
                selectableOptions[fieldName].add(specifications[fieldName])
            }
        })
    })

    const [open, setOpen] = useState(false)
    const selectableAd = subsetAds.find(({ specifications }) => Object.entries(specifications).length === selected.length)

    return (
        <>
            <div className='ad-details__button ad-details__button--small ad-details__button--black' onClick={() => {
                setOpen(true)
            }}>
                Configure Specifications
            </div>
            {
                open && (
                    <Prompt
                        title='Select Options'
                        extraClass='prompt--small ad-specification-select'
                        onClose={() => {
                            setOpen(false)
                        }}
                        body={
                            <div className='prop__column'>
                                {
                                    Object.entries(groupData.options).map(([fieldName, fieldValues], i) => {
                                        return (
                                            <div key={i}>
                                                <div className='prop__label'>
                                                    {fieldName}
                                                </div>
                                                <select
                                                    defaultValue={
                                                        selected.find((option) => {
                                                            return option.fieldName === fieldName
                                                        })?.fieldValue ?? undefined
                                                    }
                                                    onChange={(event) => {
                                                        setSelected((previous) => {
                                                            if (event.target.value === '') {
                                                                return previous.filter((option) => {
                                                                    return fieldName !== option.fieldName
                                                                })
                                                            }

                                                            const previousValue = previous.find((option) => {
                                                                return option.fieldName === fieldName
                                                            })
                                                            const newValue = { fieldName, fieldValue: event.target.value }
                                                            if (previousValue == null) {
                                                                return [...previous, newValue]
                                                            }
                                                            return previous.map((option) => {
                                                                return option.fieldName === fieldName
                                                                    ? newValue
                                                                    : option
                                                            })
                                                        })
                                                    }}
                                                >
                                                    <option key={0} value={''}>
                                                        --
                                                    </option>
                                                    {
                                                        fieldValues.map((fieldValue, j) => {
                                                            const disabled = selectableOptions[fieldName] == null || !selectableOptions[fieldName].has(fieldValue)
                                                            return (
                                                                <option
                                                                    key={j + 1}
                                                                    defaultValue={fieldValue}
                                                                    selected={selected.find((option) => option.fieldName === fieldName && option.fieldValue === fieldValue) != null}
                                                                    disabled={disabled}
                                                                >
                                                                    {fieldValue}
                                                                </option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        }
                        footer={
                            <>
                                <div className='prompt__reset' onMouseUp={() => {
                                    setSelected(normalizedInitial)
                                }}>
                                    Reset
                                </div>
                                <div className={`prompt__confirm ${selectableAd == null ? 'prompt__confirm--disabled' : ''}`} onClick={() => {
                                    if (selectableAd == null) {
                                        return
                                    }

                                    setOpen(false)
                                    navigate(`/ad/${selectableAd.pk}/`)
                                }}>
                                    Confirm
                                </div>
                            </>
                        }
                    />
                )
            }
        </>

    )
}

export default function AdDetails (): React.ReactNode {
    const ad = useLoaderData() as BaseAd
    const { allCategories } = useCategoryContext()
    const { cart, setCart } = useCartContext()
    const NormalizedCategories = new NormalizedData({
        data: allCategories,
        valueKey: 'pk',
        labelKey: 'name',
        parentKey: 'parent'
    })
    const categoryPkRoute = NormalizedCategories.getRoute(ad.category)
    const addToCart = async (): Promise<void> => {
        const response = await fetch(`/api/ads/${ad.pk}/add_to_cart/`)
        if (response.status === 404) {
            return
        }

        const item = await response.json()
        setCart({ items: [...cart.items, item] })
    }

    const ImageDisplay = (): React.ReactNode => {
        const [current, setCurrent] = useState(ad.images[0])

        return (
            <div className='img-display@ad-details'>
                <div className='img-display@ad-details__picker'>
                    {
                        ad.images.map((filename, i) => (
                            <div className='img-display@ad-details__pickable' key={i} onMouseEnter={() => {
                                setCurrent(filename)
                            }}>
                                <img src={`/media/${filename}`} alt="pickable" />
                            </div>
                        ))
                    }
                </div>
                <div className='img-display@ad-details__current'>
                    <img src={`/media/${current}`} alt="current" />
                </div>
            </div>
        )
    }

    return (
        <div className="ad-details prop">
            <div className="ad-details__header">
                <div className="ad-details__category">
                    {categoryPkRoute.map((pk, index) => (
                        <>
                            <Link className="prop__detail is-link" to={`/search/?category=${pk}`}>{NormalizedCategories.getChoice(pk).label}</Link>
                            {index < categoryPkRoute.length - 1 && <span className='prop__detail'> {'>'} </span>}
                        </>
                    ))}
                </div>
            </div>
            <div className="ad-details__imagebox">
                <ImageDisplay />
            </div>
            <div className="ad-details__main">
                <div className="ad-details__main-header">
                    <div className="ad-details__title">
                        {ad.title}
                    </div>
                    <div className="ad-details__price">
                        {addDotsToNumber(ad.price)}
                        $
                    </div>
                </div>
                <div className="ad-details__seller">
                    <div className="app__avatar">
                        <div className="avatar avatar--small">
                            <img src={ad.created_by.avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="ad-details__seller-body">
                        <div className="ad-details__seller-title">
                            {ad.created_by.display_name}
                        </div>
                        <div className="ad-details__seller-footer">
                            <div className="ad-details__seller-label">
                                {ad.created_by.account_type === 'individual' ? 'Individual Seller' : 'Business Seller'}
                            </div>
                            <div className="ad-details__seller-link">
                                No Ratings
                            </div>
                            <div className="ad-details__seller-link">
                                Seller&apos;s Profile
                            </div>
                        </div>
                    </div>
                </div>
                {
                    ad.group_data == null
                        ? Object.entries(ad.specifications_json).length !== 0 && (
                            <div className='prop prop--vertical prop--highlighted'>
                                <div className='prop__header' >
                                    <div className='prop__label'>
                                        Specifications
                                    </div>
                                </div>
                                <hr className='app__divider' />
                                <div className='prop__pairing'>
                                    {
                                        Object.entries(ad.specifications_json).map(([fieldName, fieldValue], i) => {
                                            return (
                                                <div key={i} className='prop__row prop__row--baselined'>
                                                    <div className='prop__label'>
                                                        {fieldName}
                                                    </div>
                                                    <div className='prop__detail'>
                                                        {fieldValue}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                        : (
                            <>
                                <div className='prop prop--vertical prop--highlighted'>
                                    <div className='prop__header' >
                                        <div className='prop__label'>
                                            Specifications
                                        </div>
                                        <SpecificationsSelect groupData={ad.group_data} initial={ad.specifications_json} />
                                    </div>
                                    <hr className='app__divider' />
                                    <div className='prop__pairing'>
                                        {
                                            Object.entries(ad.specifications_json).map(([fieldName, fieldValue], i) => {
                                                return (
                                                    <div key={i} className='prop__row prop__row--baselined'>
                                                        <div className='prop__label'>
                                                            {fieldName}
                                                        </div>
                                                        <div className='prop__detail'>
                                                            {fieldValue}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </>
                        )
                }
                <hr className="app__divider" />
                <AmountController ad={ad} />
                <div className="ad-details__button ad-details__button--yellow">
                    Buy Now
                </div>
                {
                    cart.items.find((item) => item.ad.pk === ad.pk) == null
                        ? (
                            <div className="ad-details__button ad-details__button--yellow" onClick={() => {
                                void addToCart()
                            }}>
                                Add to Cart
                            </div>
                        )
                        : (
                            <div className="ad-details__button ad-details__button--black">
                                See in Cart
                            </div>
                        )
                }
                <div className="ad-details__button ad-details__button--black">
                    Bookmark
                </div>
            </div>
            <div className="ad-details__footer">
                <div className="ad-details__label">
                    Description
                </div>
                <hr className="app__divider" />
                <div className="ad-details__description">
                    {ad.description}
                </div>
            </div>
        </div>
    )
}
