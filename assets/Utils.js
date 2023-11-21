import React, { useContext, useEffect } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./App";


export function useLoginRequired() {
    const { user, setUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => { 
        if (!user.is_authenticated) {
            navigate({
                pathname: "/login/",
                search: createSearchParams({
                    next: location.pathname
                }).toString()
            });
        }
    }, [])
}


export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};


export const CSRFToken = () => {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={getCookie('csrftoken')} />
    );
};

export function normalizeData({data, valueKey, labelKey, parentKey}) {
    return data.map((item) => {
        return {
            value: item[valueKey],
            label: item[labelKey],
            parent: item[parentKey],
        }
    })
}

export function getNormalizedDataHelpers(data) {
    function getRoute(value) {
        const parent = getChoice(value).parent;
        return parent ? [...getRoute(parent), value] : [value];
    }

    function getSubChoices(value) {
        return data.filter(choice => choice.parent === value);
    }

    function getChoice(value) {
        return data.find(choice => choice.value === value);
    }

    function getRouteString(value) {
        const choice = getChoice(value);
        const parent = choice.parent;
        return parent ? `${getRouteString(parent)} > ${choice.label}` : choice.label;
    }

    return {
        getRoute,
        getSubChoices,
        getChoice,
        getRouteString
    };
};