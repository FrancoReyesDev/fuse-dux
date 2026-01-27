export function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            // escape de comillas dobles
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (char === "," && !inQuotes) {
            result.push(current)
            current = ""
            continue
        }

        current += char
    }

    result.push(current)
    return result
}
