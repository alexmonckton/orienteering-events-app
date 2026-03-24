

export class OEvent {

    id: number;
    name: string;
    date: Date; // Store as timestamp
    timestamp: number;
    lat: number;
    lng: number;

    constructor(id: number, name: string, date: Date, lat: number, lng: number) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.timestamp = new Date(date).getTime(); // Store timestamp for easier filtering
        this.lat = lat;
        this.lng = lng;
    }
}

export const events: OEvent[] = [
    new OEvent(1, "City Sprint", new Date("2026-04-15"), 55.9533, -3.1883), // Edinburgh
    new OEvent(2, "City Sprint 2", new Date("2026-04-16"), 55.9534, -3.1883), // Edinburgh
    new OEvent(3, "Forest Challenge", new Date("2026-05-20"), 56.4907, -4.2026), // Glasgow
    new OEvent(4, "Park Orienteering", new Date("2026-05-10"), 55.8642, -4.2518), // Glasgow
    new OEvent(5, "Mountain Adventure", new Date("2026-06-05"), 56.4907, -5.2026), // Highlands
]