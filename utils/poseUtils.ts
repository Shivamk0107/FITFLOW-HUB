import { Landmark } from '../types';

/**
 * Calculates the angle between three 2D points.
 * @param a The first point (e.g., shoulder).
 * @param b The second point, which is the vertex of the angle (e.g., elbow).
 * @param c The third point (e.g., wrist).
 * @returns The angle in degrees, from 0 to 180.
 */
export const calculateAngle = (a: Landmark, b: Landmark, c: Landmark): number => {
    // Check for valid input
    if (!a || !b || !c) {
        return 0;
    }

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    // Ensure the angle is the smaller of the two possible angles
    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
};
