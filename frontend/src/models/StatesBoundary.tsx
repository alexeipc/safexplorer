interface StateBoundary {
    state: string;
    boundary: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
}

const stateBoundaries: StateBoundary[] = [
    // Example data structure, replace with actual state boundaries data
    { state: 'California', boundary: { minX: -124.482003, minY: 32.528832, maxX: -114.131211, maxY: 42.009519 } },
    { state: 'New York', boundary: { minX: -79.76259, minY: 40.477399, maxX: -71.856214, maxY: 45.015851 } },
    // Add more states as needed
];

export class StateLocator {
    static getState(latitude: number, longitude: number): { minY: number, minX: number, maxY: number, maxX: number } | null {
        for (const boundary of stateBoundaries) {
            if (latitude >= boundary.boundary.minY && latitude <= boundary.boundary.maxY &&
                longitude >= boundary.boundary.minX && longitude <= boundary.boundary.maxX) {
                console.log(boundary.state)
                return boundary.boundary;
            }
        }
        return null; // No state found for the given coordinates
    }
}
