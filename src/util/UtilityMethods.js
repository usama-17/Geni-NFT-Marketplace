import React from "react";

export const shortenAddress = (address) => {
    if (address) {
        const start = address.substring(0, 10);
        const end = address.substring(address.length - 11, address.length);
        return start + '...' + end;
    }

    return "John Doe";
}

export const substringAddress = (address, currentUser = "") => {
    if (address) {
        if (address === "0x8095f2430Eb776A38aC6Ee4F125EC90D2104DdC6".toLowerCase())
            return "Marketplace"
        else if (address === currentUser)
            return "you";
        else
            return address.toUpperCase().substring(0, 6);
    }
    return "";
}

export const prettifyEvent = (event) => {
    switch (event) {
        case "Transfer":
        case "TransferSingle":
            return <>
                <i className="fas fa-exchange-alt me-2"/> Transfer
            </>
        case "Minted":
            return <>
                <i className="fas fa-money-check-alt me-2"/> Minted
            </>
        case "CharacterList":
        case "SkinList":
            return <>
                <i className="fas fa-tag me-2"/> List
            </>
        case "CharacterSale":
        case "CharacterOfferFulfilled":
        case "SkinSale":
        case "SkinsOfferFulfilled":
            return <>
                <i className="fas fa-shopping-cart me-2"/> Sale
            </>
        case "CharacterOffered":
        case "SkinsOffered":
            return <>
                <i className="fas fa-hand-paper me-2"/> Offer
            </>
        default:
            return event;
    }
}