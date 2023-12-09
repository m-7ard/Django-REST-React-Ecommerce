import React, { useContext, useEffect } from 'react'
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from './Context'
import { type NormalizedDataItem, type UnnormalizedData } from './Types'

export function useLoginRequired () {
    const { user, setUser } = useContext(UserContext)
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user.is_authenticated) {
            navigate({
                pathname: '/login/',
                search: createSearchParams({
                    next: location.pathname
                }).toString()
            })
        }
    }, [])
}

export function getCookie (name: string): string | null | undefined {
    let cookieValue = null
    if ((document.cookie != null) && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}

export function CSRFToken () {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={getCookie('csrftoken')} />
    )
}

export function normalizeData ({
    data, valueKey, labelKey, parentKey
}) {
    return data.map((item) => ({
        value: item[valueKey],
        label: item[labelKey],
        parent: item[parentKey]
    }))
}

export async function fileListToBase64 (fileList) {
    async function getBase64 (file) {
        const reader = new FileReader()
        return await new Promise((resolve) => {
            reader.onload = (ev) => {
                resolve(ev.target.result)
            }
            reader.readAsDataURL(file)
        })
    }
    const promises = []

    for (let i = 0; i < fileList.length; i++) {
        promises.push(getBase64(fileList[i]))
    }

    return await Promise.all(promises)
}

export class NormalizedData {
    data: NormalizedDataItem[]

    constructor ({ data, valueKey, labelKey, parentKey }: UnnormalizedData) {
        this.data = this.normalizeData({ data, valueKey, labelKey, parentKey })
    }

    normalizeData ({ data, valueKey, labelKey, parentKey }: UnnormalizedData): NormalizedDataItem[] {
        return data.map((item) => ({
            value: item[valueKey],
            label: item[labelKey],
            parent: item[parentKey]
        }))
    }

    getRoute (value: number): number[] {
        const choice = this.getChoice(value)
        const parent = choice?.parent

        if (parent === undefined) {
            return [value]
        }
        else {
            return [...this.getRoute(parent), value]
        }
    }

    getSubChoices (value: number): NormalizedDataItem[] {
        return this.data.filter((choice) => choice.parent === value)
    }

    getChoice (value: number): NormalizedDataItem | undefined {
        return this.data.find((choice) => choice.value === value)
    }

    getRouteString (value: number): string {
        const choice = this.getChoice(value)

        if (choice == null) {
            throw Error('Not a valid choice')
        }

        const parent = choice?.parent
        if (parent == null) {
            return choice.label
        }
        else {
            return `${this.getRouteString(parent)} > ${choice.label}`
        }
    }
}

export function addDotsToNumber (number) {
    let numStr = number.toString()
    const groups = []
    while (numStr.length > 0) {
        groups.unshift(numStr.slice(-3))
        numStr = numStr.slice(0, -3)
    }

    return groups.join('.')
}