import { sub } from "three/tsl"
import { Dimensions } from "../types/RandomGeneration"

export function getRandomDimensions(): Dimensions {
  return {
    width: Math.floor(Math.random() * 15) + 5,
    height: Math.floor(Math.random() * 2) + 4,
    depth: Math.floor(Math.random() * 10) + 5,
  }
}

export function getRandomSubdivision(length: number, symmetric: boolean = false, maxLength: number = 7, minLength: number = 3): number[] {
    const subdivisions = []
    if (length <= maxLength && Math.random() < 0.7) {
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
            if (Math.random() < 0.5) {
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
            if (!splitPossible || (remainingLength <= maxLength && Math.random() < 0.7)) {
                subdivisions.push(remainingLength)
                remainingLength = 1
                break
            }

            const nextLength = getRandomNumber(minLength, Math.min(maxLength, remainingLength - minLength + 1))
            subdivisions.push(nextLength)
            remainingLength -= nextLength - 1
        }

        if (remainingLength > 1) {
            console.log("Remaining length after subdivision:", remainingLength)
        }
    }

    if (subdivisions.reduce((a, b) => a + b - 1, 1) !== length) {
        console.error("Subdivision lengths do not sum up to original length", subdivisions, length)
    }

    return subdivisions
}


export function getRandomNumber(min: number, max: number, reduceEveness: boolean = true): number {
    let rand = Math.floor(Math.random() * (max - min + 1)) + min
    if (reduceEveness && rand % 2 === 0) {
        rand = Math.floor(Math.random() * (max - min + 1)) + min
    }
    return rand
}