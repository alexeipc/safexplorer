export function webMercatorToLatLong(wm: number[]): [number, number] {
    const lon = (wm[0] / 20037508.34) * 180;
    let lat = (wm[1] / 20037508.34) * 180;
    lat =
        (180 / Math.PI) *
        (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
    return [lat, lon];
}

export function latLongToWebMercator(latlon: number[]): [number, number] {
    const x = (latlon[1] * 20037508.34) / 180;
    let y =
        Math.log(Math.tan(((90 + latlon[0]) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return [x, y];
}