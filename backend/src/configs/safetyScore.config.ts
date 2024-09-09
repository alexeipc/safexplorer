import { Crime } from "../interfaces/crime";

function calculateDaysFromToday(dateString: string): number {
    // Parse the dateString into components
    const year = Number(dateString.substr(0, 4));
    const month = Number(dateString.substr(4, 2)) - 1; // Months are zero-based in Date objects
    const day = Number(dateString.substr(6, 2));
    const hour = Number(dateString.substr(8, 2));
    const minute = Number(dateString.substr(10, 2));
    const second = Number(dateString.substr(12, 2));

    // Create Date object from parsed components
    const targetDate = new Date(year, month, day, hour, minute, second);

    // Get current date
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const differenceMs = targetDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    return Math.abs(differenceDays);
}

export const safetyScoreConfig = {
    GROUND_SCORE: [0.3, 0.8, 0.6, 0.1, 0.4, 0.7, 0.2, 1, 0.3, 0.6, 0.6, 0.2, 0.2, 0.3, 0.2, 0.2, 0.4],
    CRIME_NAME: [{"id":1,"na":"Arson"},{"id":2,"na":"Assault"},{"id":3,"na":"Burglary"},{"id":4,"na":"Disturbing the Peace"},{"id":5,"na":"Drugs / Alcohol Violations"},{"id":6,"na":"DUI"},{"id":7,"na":"Fraud"},{"id":8,"na":"Homicide"},{"id":9,"na":"Motor Vehicle Theft"},{"id":10,"na":"Robbery"},{"id":11,"na":"Sex Crimes"},{"id":12,"na":"Theft / Larceny"},{"id":13,"na":"Vandalism"},{"id":14,"na":"Vehicle Break-In / Theft"},{"id":15,"na":"Weapons"},{"id":17,"na":"Sex Offender"},{"id":18,"na":"Sexual Predator"}],
    CRIME_CONSTANT: 0.5,
    SAFETY_SCORE_FORMULAR: (crimes: Crime[]) => {
        var weightedScore = 0;

        crimes.forEach((value: Crime) => {
            if (value.type) {
                var days = value.date ? calculateDaysFromToday(value.date) : 2;

                var weight = safetyScoreConfig.GROUND_SCORE[value.type - 1] / (1 + days * safetyScoreConfig.CRIME_CONSTANT);

                weightedScore += weight;
            }
        })

        return weightedScore;
    }
}