import { Dimensions } from "../types/RandomGeneration"

var seed: number = Date.now();

/**
 * @returns Random number between 0 and 1
 */
export function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

/**
 * 
 * @param min Minimum number
 * @param max Maximum number
 * @returns A random integer between min and max including min but excluding max.
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(random() * (max - min)) + min;
}

/**
 * 
 * @param arr The array to pick a random entry from.
 * @returns An entry from the array picked at random.
 */
export function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)];
}

/**
 * TODO: Currently the ranges for the dimensions are fixed
 * @returns Random dimensions.
 */
export function getRandomDimensions(reduceEveness: number = 0.5): Dimensions {
  return {
    width: getRandomNumber(6, 20, reduceEveness),
    height: getRandomInt(4, 6),
    depth: getRandomNumber(5, 15, reduceEveness),
  }
}

/**
 * Randomly subdivides a given length into parts with given minimum and maximum length.
 * @param length The total length to subdevide.
 * @param symmetric If set to true the returned subdivision is symetric.
 * @param maxLength The maximum length of an intervall in the result.
 * @param minLength The minimum length of an intervall in the result. Problems may arise if maxLength + 1 < 2 * minLength since then an intervall of length maxLength may not be subdivided into two intervalls of length minLength.
 * @returns An arrray of the length of the resulting intervalls.
 */
export function getRandomSubdivision(length: number, symmetric: boolean = false, maxLength: number = 7, minLength: number = 3): number[] {
    const subdivisions = []
    if (length <= maxLength && random() < 0.7) {
        return [length]
    }

    if (length <= minLength) {
        return [length]
    }

    if (symmetric) {
        // To ensure symmetry place either a pillar in the middle or a gap
        // For even lengths it always has to be a gap, for odd lengths it can be either
        if (length % 2 == 0) {
            if (length <= 2 * minLength + 2) {
                return [length]
            }
            const halfMax = Math.floor((maxLength-2) / 2)
            const halfMin = Math.ceil((minLength-2) / 2)

            let currentMaxLength = (length - 2 * minLength) / 2
            currentMaxLength = Math.min(currentMaxLength, halfMax)
            if (currentMaxLength < halfMin) {
                return [length]
            }
            // Random number between halfMin and currentMaxLength
            const halfMiddleLength = getRandomNumber(halfMin, currentMaxLength)
            const remainingHalfLength = length  / 2 - halfMiddleLength

            const firstHalf = getRandomSubdivision(remainingHalfLength, false, maxLength, minLength)

            // return firstHalf + middle + reverse firstHalf
            subdivisions.push(...firstHalf)
            subdivisions.push(halfMiddleLength * 2 + 2)
            subdivisions.push(...firstHalf.reverse())
        } else {
            if (random() < 0.5) {
                // Place gap in the middle
                const middleLength = getRandomNumber(Math.floor(minLength / 2), Math.floor((maxLength - 1) / 2)) * 2 + 1

                const halfLength = Math.floor((length - middleLength + 2) / 2)

                if (halfLength >= minLength) {
                    const firstHalf = getRandomSubdivision(halfLength, false, maxLength, minLength)
                    
                    // return firstHalf + middle + reverse firstHalf
                    subdivisions.push(...firstHalf)
                    subdivisions.push(middleLength)
                    subdivisions.push(...firstHalf.reverse())
                }
            }
            if (subdivisions.length === 0) {
                // Place pillar in the middle
                const halfLength = Math.floor(length / 2) + 1
                const firstHalf = getRandomSubdivision(halfLength, false, maxLength, minLength)

                // return firstHalf + reverse firstHalf
                subdivisions.push(...firstHalf)
                subdivisions.push(...firstHalf.reverse())
            }
        }
    } else {
        let remainingLength = length
        while (remainingLength >= minLength) {
            const splitPossible = remainingLength - minLength + 1 >= minLength
            if (!splitPossible || (remainingLength <= maxLength && random() < 0.7)) {
                subdivisions.push(remainingLength)
                remainingLength = 1
                break
            }

            const nextLength = getRandomNumber(minLength, Math.min(maxLength, remainingLength - minLength + 1))
            subdivisions.push(nextLength)
            remainingLength -= nextLength - 1
        }

        if (remainingLength > 1) {
            console.warn("Remaining length after subdivision:", remainingLength)
        }
    }

    if (subdivisions.reduce((a, b) => a + b - 1, 1) !== length) {
        console.error("Subdivision lengths do not sum up to original length", subdivisions, length)
    }

    return subdivisions
}

/**
 * Returns a random integer in the given range (including both ends) but allows to reduce the eveness by 
 * @param min Minimum number possible as a result.
 * @param max Maximum number possible as a result.
 * @param reduceEveness By how much the chance of getting a even number is reduced.
 * @returns 
 */
export function getRandomNumber(min: number, max: number, reduceEveness: number = 0.6): number {
    let rand = getRandomInt(min, max + 1)
    if (rand % 2 === 0 && reduceEveness > random()) {
        // randomly decrease or increase by one and respect the minimum and maximum
        if (rand !== min && (random() < 0.5 || rand === max)) {
            rand--
        } else if (rand !== max) {
            rand++
        }
    }
    return rand
}