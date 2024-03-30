export const isSubset = (a: Record<string, string>, b: Record<string, string>): boolean => {
    return !Object.entries(a).some(
        ([k, v]) => b[k] !== v
    )
}

export const checkMatchExpressions = (matchExpressions: any, podLabels: any): boolean => false

// Experimental, and, seemingly wrong, use isSubset above
export const checkMatchLabels = (matchLabels: Record<string, string>, rawPodLabels: Record<string, string>): boolean => {
    const podLabels = Object.fromEntries(
        Object.entries(rawPodLabels).filter(
            ([k]) => k !== "pod-template-hash"
        )
    )
    return (Object.keys(matchLabels).toString() === Object.keys(podLabels).toString()) && !Object.entries(matchLabels).some(
    	([k, v]) => podLabels[k] !== v
    )
}
