import {
    Component,
    Handshake,
    Heart,
    House,
    Plane,
    UsersRound,
} from "lucide-react";

export enum GROUP_TYPE {
    HOUSEHOLD = "HOUSEHOLD",
    TRIP = "TRIP",
    FRIENDS = "FRIENDS",
    COUPLE = "COUPLE",
    FAMILY = "FAMILY",
    OTHER = "OTHER",
}

export const GROUP_TYPES = {
    HOUSEHOLD: {
        icon: House,
        label: "Casa",
        color: "transition-colors duration-300 !bg-yellow hover:bg-yellow/90",
    },
    TRIP: {
        icon: Plane,
        label: "Viaje",
        color: "transition-colors duration-300 !bg-blue hover:bg-blue/90",
    },
    FRIENDS: {
        icon: Handshake,
        label: "Amigos",
        color: "transition-colors duration-300 !bg-green hover:bg-green/90",
    },
    COUPLE: {
        icon: Heart,
        label: "Pareja",
        color: "transition-colors duration-300 !bg-red hover:bg-red/90",
    },
    FAMILY: {
        icon: UsersRound,
        label: "Familia",
        color: "transition-colors duration-300 !bg-orange hover:bg-orange/90",
    },
    OTHER: {
        icon: Component,
        label: "Otros",
        color: "transition-colors duration-300 !bg-secondary hover:bg-secondary/90",
    },
};

export const GROUP_CATEGORIES = [
    GROUP_TYPE.HOUSEHOLD,
    GROUP_TYPE.FAMILY,
    GROUP_TYPE.FRIENDS,
    GROUP_TYPE.COUPLE,
    GROUP_TYPE.TRIP,
    GROUP_TYPE.OTHER
]
